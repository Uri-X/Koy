import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateMerchantDto } from "./dto/create-merchant.dto";
import { EarningRuleType } from "db";

@Injectable()
export class MerchantsService {
  constructor(private readonly prisma: PrismaService) {}

  // Creates a merchant plus its initial SPEND_THRESHOLD earning rule in one
  // step, since v1 onboarding always sets both together (PRD 6.1).
  create(dto: CreateMerchantDto) {
    return this.prisma.client.merchant.create({
      data: {
        name: dto.name,
        industry: dto.industry,
        logoUrl: dto.logoUrl,
        location: dto.location,
        redemptionTarget: dto.redemptionTarget,
        rewardDescription: dto.rewardDescription,
        rewardType: dto.rewardType,
        earningRules: {
          create: {
            type: EarningRuleType.SPEND_THRESHOLD,
            config: {
              thresholdAmount: dto.thresholdAmount,
              starsPerThreshold: dto.starsPerThreshold ?? 1,
              currency: dto.currency ?? "KES",
            },
          },
        },
      },
      include: { earningRules: true },
    });
  }

  findAll() {
    return this.prisma.client.merchant.findMany();
  }

  async findOne(id: string) {
    const merchant = await this.prisma.client.merchant.findUnique({
      where: { id },
      include: { earningRules: { where: { isActive: true } } },
    });
    if (!merchant) throw new NotFoundException("Merchant not found");
    return merchant;
  }

  // Merchant-side dashboard: customer list with running star balances.
  listMembers(merchantId: string) {
    return this.prisma.client.merchantMembership.findMany({
      where: { merchantId },
      include: { user: true },
      orderBy: { currentStars: "desc" },
    });
  }
}
