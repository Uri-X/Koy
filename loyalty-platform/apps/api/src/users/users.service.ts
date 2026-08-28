import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  create(data: { name: string; phone?: string; email?: string }) {
    return this.prisma.client.user.create({ data });
  }
  // Signup step 2: join a merchant's loyalty program (PRD 5.3)
  async joinMerchant(userId: string, merchantId: string) {
    const existing = await this.prisma.client.merchantMembership.findUnique({
      where: { userId_merchantId: { userId, merchantId } },
    });
    if (existing) return existing;
    return this.prisma.client.merchantMembership.create({
      data: { userId, merchantId },
      include: { merchant: true },
    });
  }
  // POS lookup — v1 default identification method (PRD 6.2): phone search,
  // with QR-scan as the faster alternate path once the client encodes it.
  findByPhone(phone: string) {
    return this.prisma.client.user.findUnique({ where: { phone } });
  }

  async findOne(id: string) {
    const user = await this.prisma.client.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException("User not found");
    return user;
  }

  // Customer dashboard: all of a customer's merchant memberships + balances
  listMemberships(userId: string) {
    return this.prisma.client.merchantMembership.findMany({
      where: { userId },
      include: { merchant: true },
    });
  }
}
