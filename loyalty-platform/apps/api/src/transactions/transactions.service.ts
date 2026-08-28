import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";
import { EarningRuleType } from "db";

// Shape of EarningRule.config when type === SPEND_THRESHOLD
interface SpendThresholdConfig {
  thresholdAmount: number;
  starsPerThreshold: number;
  currency: string;
}

@Injectable()
export class TransactionsService {
  constructor(private readonly prisma: PrismaService) {}

  // Core loop (PRD Section 4 & 6.2):
  //   1. Log the transaction
  //   2. Apply the merchant's active earning rule to compute stars awarded
  //   3. Upsert the customer's MerchantMembership balance
  // All three happen in one DB transaction so balances never drift from the
  // transaction log.
  async create(dto: CreateTransactionDto) {
    const rule = await this.prisma.client.earningRule.findFirst({
      where: {
        merchantId: dto.merchantId,
        isActive: true,
        type: EarningRuleType.SPEND_THRESHOLD,
      },
    });
    if (!rule) {
      throw new NotFoundException(
        "No active earning rule configured for this merchant",
      );
    }

    const starsAwarded = this.calculateStars(dto.amount, rule.config as unknown as SpendThresholdConfig);

    return this.prisma.client.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          merchantId: dto.merchantId,
          userId: dto.userId,
          amount: dto.amount,
          starsAwarded,
          loggedBy: dto.loggedBy,
        },
      });

      const membership = await tx.merchantMembership.upsert({
        where: {
          userId_merchantId: { userId: dto.userId, merchantId: dto.merchantId },
        },
        create: {
          userId: dto.userId,
          merchantId: dto.merchantId,
          currentStars: starsAwarded,
          lifetimeStars: starsAwarded,
        },
        update: {
          currentStars: { increment: starsAwarded },
          lifetimeStars: { increment: starsAwarded },
        },
      });

      return { transaction, membership };
    });
  }

  // v1 implementation of SPEND_THRESHOLD: every full multiple of
  // thresholdAmount in a single transaction earns starsPerThreshold stars.
  // e.g. threshold=2500, starsPerThreshold=1, amount=5200 -> 2 stars.
  private calculateStars(amount: number, config: SpendThresholdConfig): number {
    if (!config?.thresholdAmount || config.thresholdAmount <= 0) return 0;
    const multiples = Math.floor(amount / config.thresholdAmount);
    return multiples * (config.starsPerThreshold ?? 1);
  }

  findForMerchant(merchantId: string) {
    return this.prisma.client.transaction.findMany({
      where: { merchantId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
  }

  findForUser(userId: string) {
    return this.prisma.client.transaction.findMany({
      where: { userId },
      include: { merchant: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
