import { IsNumber, IsOptional, IsString, Min } from "class-validator";

export class CreateTransactionDto {
  @IsString()
  merchantId!: string;

  @IsString()
  userId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  // Staff/admin user id who logged it (optional in v1, useful for audit trail)
  @IsString()
  @IsOptional()
  loggedBy?: string;
}
