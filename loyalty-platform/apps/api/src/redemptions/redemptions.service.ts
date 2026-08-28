import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { RedemptionStatus } from "db";

@Injectable()
export class RedemptionsService {
  constructor(private readonly prisma: PrismaService) {}

  // Customer taps "Redeem" (PRD 6.4). Creates a PENDING redemption and
  // immediately deducts stars so the balance can't be double-spent while
  // the merchant hasn't yet confirmed fulfillment.
  async request(merchantId: string, userId: string) {
    const merchant = await this.prisma.client.merchant.findUnique({ where: { id: merchantId } });
    if (!merchant) throw new NotFoundException("Merchant not found");

    const membership = await this.prisma.client.merchantMembership.findUnique({
      where: { userId_merchantId: { userId, merchantId } },
    });
    if (!membership || membership.currentStars < merchant.redemptionTarget) {
      throw new BadRequestException("Not enough stars to redeem");
    }

    return this.prisma.client.$transaction(async (tx) => {
      await tx.merchantMembership.update({
        where: { userId_merchantId: { userId, merchantId } },
        data: { currentStars: { decrement: merchant.redemptionTarget } },
      });

      return tx.redemption.create({
        data: {
          merchantId,
          userId,
          starsUsed: merchant.redemptionTarget,
          rewardDescription: merchant.rewardDescription,
          status: RedemptionStatus.PENDING,
        },
      });
    });
  }

  // Merchant staff verifies and marks it redeemed (PRD 6.4)
  async fulfill(redemptionId: string) {
    const redemption = await this.prisma.client.redemption.findUnique({ where: { id: redemptionId } });
    if (!redemption) throw new NotFoundException("Redemption not found");

    return this.prisma.client.redemption.update({
      where: { id: redemptionId },
      data: { status: RedemptionStatus.FULFILLED, fulfilledAt: new Date() },
    });
  }

  findForMerchant(merchantId: string) {
    return this.prisma.client.redemption.findMany({
      where: { merchantId },
      include: { user: true },
      orderBy: { createdAt: "desc" },
    });
  }

  findForUser(userId: string) {
    return this.prisma.client.redemption.findMany({
      where: { userId },
      include: { merchant: true },
      orderBy: { createdAt: "desc" },
    });
  }
}
