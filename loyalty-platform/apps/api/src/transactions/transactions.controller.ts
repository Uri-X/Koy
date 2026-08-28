import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { TransactionsService } from "./transactions.service";
import { CreateTransactionDto } from "./dto/create-transaction.dto";

@Controller("transactions")
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  // Merchant/staff logs a transaction at point of sale (PRD 6.2)
  @Post()
  create(@Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(dto);
  }

  @Get()
  find(@Query("merchantId") merchantId?: string, @Query("userId") userId?: string) {
    if (merchantId) return this.transactionsService.findForMerchant(merchantId);
    if (userId) return this.transactionsService.findForUser(userId);
    return [];
  }
}
