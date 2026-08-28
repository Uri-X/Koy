import { Body, Controller, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { RedemptionsService } from "./redemptions.service";

@Controller("redemptions")
export class RedemptionsController {
  constructor(private readonly redemptionsService: RedemptionsService) {}

  @Post()
  request(@Body() body: { merchantId: string; userId: string }) {
    return this.redemptionsService.request(body.merchantId, body.userId);
  }

  @Patch(":id/fulfill")
  fulfill(@Param("id") id: string) {
    return this.redemptionsService.fulfill(id);
  }

  @Get()
  find(@Query("merchantId") merchantId?: string, @Query("userId") userId?: string) {
    if (merchantId) return this.redemptionsService.findForMerchant(merchantId);
    if (userId) return this.redemptionsService.findForUser(userId);
    return [];
  }
}
