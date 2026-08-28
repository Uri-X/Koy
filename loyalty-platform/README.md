# Loyalty Platform

Monorepo scaffold for the loyalty points platform described in the PRD:
industry-agnostic core, HORECA pilot (Souk), Web v1 → Mobile v2 on a shared backend.

## Structure

```
apps/
  api/    NestJS backend (REST API)
  web/    Next.js frontend (Web v1)
packages/
  db/     Prisma schema + shared client, consumed by apps/api
```

## Stack

Next.js + NestJS + PostgreSQL + Prisma, TypeScript end-to-end, pnpm workspaces.

## Prerequisites

- Node.js 20+
- pnpm (`npm i -g pnpm`)
- A PostgreSQL database (local or hosted, e.g. Railway/Render)

## Setup

```bash
pnpm install
cp .env.example .env      # set DATABASE_URL to your Postgres instance
pnpm db:migrate            # creates tables from packages/db/prisma/schema.prisma
pnpm db:generate
```

## Run

```bash
pnpm dev:api    # http://localhost:4000
pnpm dev:web    # http://localhost:3000
```

## What's implemented in this scaffold

- **Prisma schema** (`packages/db/prisma/schema.prisma`) matching the PRD data model:
  Merchant, EarningRule (pluggable, spend_threshold implemented), MerchantMembership,
  Transaction, Redemption, MerchantStaff, industry + rewardType enums.
- **NestJS API**: Merchants (onboarding + config), Users (signup + phone lookup),
  Transactions (core star-earning logic — spend threshold calculation, balance
  upsert, all in one DB transaction), Redemptions (request/fulfill flow with
  star deduction).
- **Next.js web app**: route skeletons for `/merchant/dashboard` and
  `/customer/dashboard` with a reusable `StarProgress` component (symbol is
  configurable per merchant, not hardcoded to a star).

## What's intentionally stubbed / not yet wired

- Auth (recommend Clerk or Auth.js — not included here)
- Dashboards currently render mock data; need to be connected to the API
  (`GET /merchants/:id/members`, `GET /users/:id/memberships`, etc.)
- QR code generation/scanning for POS lookup and redemption
- Notifications (in-app/email)

## Open decisions (see PRD Section 10)

These affect the schema/config and should be resolved before building further:
currency + default threshold, single-merchant vs multi-tenant onboarding,
POS customer identification method, and whether points are ever pooled
across merchants (currently modeled as strictly siloed per merchant).
