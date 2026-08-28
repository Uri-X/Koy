import { Injectable, OnModuleInit, OnModuleDestroy } from "@nestjs/common";
import { prisma } from "db";

// Thin wrapper so Nest can manage lifecycle hooks around the shared
// singleton Prisma client exported from the `db` workspace package.
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  readonly client = prisma;

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
