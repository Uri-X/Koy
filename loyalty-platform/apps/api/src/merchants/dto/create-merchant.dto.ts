import { IsEnum, IsInt, IsOptional, IsString, Min } from "class-validator";
import { Industry, RewardType } from "db";

export class CreateMerchantDto {
  @IsString()
  name!: string;

  @IsEnum(Industry)
  @IsOptional()
  industry?: Industry;

  @IsString()
  @IsOptional()
  logoUrl?: string;

  @IsString()
  @IsOptional()
  location?: string;

  // Initial earning rule (v1: SPEND_THRESHOLD only)
  @IsInt()
  @Min(1)
  thresholdAmount!: number;

  @IsInt()
  @Min(1)
  @IsOptional()
  starsPerThreshold?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  // Redemption config
  @IsInt()
  @Min(1)
  redemptionTarget!: number;

  @IsString()
  rewardDescription!: string;

  @IsEnum(RewardType)
  @IsOptional()
  rewardType?: RewardType;
}
