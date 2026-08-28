import { Body, Controller, Get, Param, Post, Query } from "@nestjs/common";
import { UsersService } from "./users.service";

@Controller("users")
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() body: { name: string; phone?: string; email?: string }) {
    return this.usersService.create(body);
  }
  @Post(":id/join/:merchantId")
  joinMerchant(
    @Param("id") id: string,
    @Param("merchantId") merchantId: string
  ) {
    return this.usersService.joinMerchant(id, merchantId);
  }
  @Get("lookup")
  findByPhone(@Query("phone") phone: string) {
    return this.usersService.findByPhone(phone);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.usersService.findOne(id);
  }

  @Get(":id/memberships")
  listMemberships(@Param("id") id: string) {
    return this.usersService.listMemberships(id);
  }
}
