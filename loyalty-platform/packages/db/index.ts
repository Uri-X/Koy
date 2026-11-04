import { PrismaClient } from "@prisma/client";

// Shared singleton so both the NestJS API and any scripts/edge functions
// reuse one Prisma client instance instead of exhausting DB connections.
declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

export const prisma = global.__prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.__prisma = prisma;
}

export * from "@prisma/client";

// 👇 ADD THIS BLOCK TO EXPORT THE CODES YOUR API EXPECTS 👇
export const Industry = {
  RETAIL: 'RETAIL',
  FOOD_BEVERAGE: 'FOOD_BEVERAGE',
  OTHER: 'OTHER',
} as const;
export type Industry = typeof Industry[keyof typeof Industry];

export const RewardType = {
  CASHBACK: 'CASHBACK',
  STARS: 'STARS',
  FREE_ITEM: 'FREE_ITEM',
} as const;
export type RewardType = typeof RewardType[keyof typeof RewardType];

export const RedemptionStatus = {
  PENDING: 'PENDING',
  COMPLETED: 'COMPLETED',
  FAILED: 'FAILED',
} as const;
export type RedemptionStatus = typeof RedemptionStatus[keyof typeof RedemptionStatus];

export const EarningRuleType = {
  SPEND_THRESHOLD: 'SPEND_THRESHOLD',
} as const;
export type EarningRuleType = typeof EarningRuleType[keyof typeof EarningRuleType];
