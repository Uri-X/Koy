-- CreateEnum
CREATE TYPE "Industry" AS ENUM ('HORECA', 'RETAIL', 'WELLNESS', 'SERVICES', 'OTHER');

-- CreateEnum
CREATE TYPE "RewardType" AS ENUM ('FREE_ITEM', 'DISCOUNT_PERCENT', 'DISCOUNT_FIXED', 'CASH_VALUE', 'CUSTOM');

-- CreateEnum
CREATE TYPE "EarningRuleType" AS ENUM ('SPEND_THRESHOLD', 'VISIT_COUNT', 'CUSTOM');

-- CreateEnum
CREATE TYPE "RedemptionStatus" AS ENUM ('PENDING', 'FULFILLED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "MerchantRole" AS ENUM ('ADMIN', 'STAFF');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "industry" "Industry" NOT NULL DEFAULT 'OTHER',
    "logoUrl" TEXT,
    "location" TEXT,
    "redemptionTarget" INTEGER NOT NULL DEFAULT 10,
    "rewardDescription" TEXT NOT NULL DEFAULT 'Free item',
    "rewardType" "RewardType" NOT NULL DEFAULT 'FREE_ITEM',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "merchants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "earning_rules" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "type" "EarningRuleType" NOT NULL DEFAULT 'SPEND_THRESHOLD',
    "config" JSONB NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "earning_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_staff" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" "MerchantRole" NOT NULL DEFAULT 'STAFF',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "merchant_staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "merchant_memberships" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "currentStars" INTEGER NOT NULL DEFAULT 0,
    "lifetimeStars" INTEGER NOT NULL DEFAULT 0,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "merchant_memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "starsAwarded" INTEGER NOT NULL DEFAULT 0,
    "loggedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "redemptions" (
    "id" TEXT NOT NULL,
    "merchantId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "starsUsed" INTEGER NOT NULL,
    "rewardDescription" TEXT NOT NULL,
    "status" "RedemptionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fulfilledAt" TIMESTAMP(3),

    CONSTRAINT "redemptions_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "earning_rules_merchantId_isActive_idx" ON "earning_rules"("merchantId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_staff_merchantId_userId_key" ON "merchant_staff"("merchantId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "merchant_memberships_userId_merchantId_key" ON "merchant_memberships"("userId", "merchantId");

-- CreateIndex
CREATE INDEX "transactions_merchantId_userId_idx" ON "transactions"("merchantId", "userId");

-- CreateIndex
CREATE INDEX "redemptions_merchantId_userId_idx" ON "redemptions"("merchantId", "userId");

-- AddForeignKey
ALTER TABLE "earning_rules" ADD CONSTRAINT "earning_rules_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_staff" ADD CONSTRAINT "merchant_staff_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_staff" ADD CONSTRAINT "merchant_staff_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_memberships" ADD CONSTRAINT "merchant_memberships_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "merchant_memberships" ADD CONSTRAINT "merchant_memberships_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_merchantId_fkey" FOREIGN KEY ("merchantId") REFERENCES "merchants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "redemptions" ADD CONSTRAINT "redemptions_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
