import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { MerchantsModule } from "./merchants/merchants.module";
import { UsersModule } from "./users/users.module";
import { TransactionsModule } from "./transactions/transactions.module";
import { RedemptionsModule } from "./redemptions/redemptions.module";

@Module({
  imports: [
    PrismaModule,
    MerchantsModule,
    UsersModule,
    TransactionsModule,
    RedemptionsModule,
  ],
})
export class AppModule {}
