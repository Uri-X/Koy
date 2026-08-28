import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { MerchantsService } from "./merchants.service";
import { CreateMerchantDto } from "./dto/create-merchant.dto";

@Controller("merchants")
export class MerchantsController {
  constructor(private readonly merchantsService: MerchantsService) {}

  @Post()
  create(@Body() dto: CreateMerchantDto) {
    return this.merchantsService.create(dto);
  }

  @Get()
  findAll() {
    return this.merchantsService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.merchantsService.findOne(id);
  }

  // Merchant dashboard: all customers + their star balance for this merchant
  @Get(":id/members")
  listMembers(@Param("id") id: string) {
    return this.merchantsService.listMembers(id);
  }
}
