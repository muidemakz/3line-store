-- ============================================================
-- Full schema sync — safe to re-run (IF NOT EXISTS everywhere)
-- ============================================================

-- ── Enums ────────────────────────────────────────────────────
DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "OrderStatus" AS ENUM ('PENDING', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "TokenType" AS ENUM ('ACCESS', 'REFRESH', 'PASSWORD_RESET', 'EMAIL_VERIFICATION');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ── grade_levels ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "grade_levels" (
  id              TEXT        NOT NULL PRIMARY KEY,
  name            TEXT        NOT NULL UNIQUE,
  "defaultPoints" INTEGER     NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── users ────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "users" (
  id                TEXT        NOT NULL PRIMARY KEY,
  email             TEXT        NOT NULL UNIQUE,
  password          TEXT        NOT NULL,
  "firstName"       TEXT        NOT NULL,
  "lastName"        TEXT        NOT NULL,
  phone             TEXT,
  role              "Role"      NOT NULL DEFAULT 'USER',
  status            "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "isEmailVerified" BOOLEAN     NOT NULL DEFAULT FALSE,
  "lastLoginAt"     TIMESTAMPTZ,
  "gradeLevelId"    TEXT        REFERENCES "grade_levels"(id),
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── sessions ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "sessions" (
  id          TEXT        NOT NULL PRIMARY KEY,
  name        TEXT        NOT NULL UNIQUE,
  "startDate" TIMESTAMPTZ NOT NULL,
  "endDate"   TIMESTAMPTZ NOT NULL,
  "isActive"  BOOLEAN     NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── user_session_points ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS "user_session_points" (
  id                TEXT        NOT NULL PRIMARY KEY,
  "userId"          TEXT        NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "sessionId"       TEXT        NOT NULL REFERENCES "sessions"(id) ON DELETE CASCADE,
  "allocatedPoints" INTEGER     NOT NULL DEFAULT 0,
  "remainingPoints" INTEGER     NOT NULL DEFAULT 0,
  "createdAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("userId", "sessionId")
);

-- ── products ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "products" (
  id              TEXT           NOT NULL PRIMARY KEY,
  "sessionId"     TEXT           NOT NULL REFERENCES "sessions"(id) ON DELETE CASCADE,
  title           TEXT           NOT NULL,
  description     TEXT           NOT NULL,
  image           TEXT,
  "nairaPrice"    DECIMAL(10,2)  NOT NULL,
  "pointsPrice"   INTEGER        NOT NULL,
  "stockQuantity" INTEGER        NOT NULL DEFAULT 0,
  "createdAt"     TIMESTAMPTZ    NOT NULL DEFAULT NOW(),
  "updatedAt"     TIMESTAMPTZ    NOT NULL DEFAULT NOW()
);

-- ── cart_items ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "cart_items" (
  id          TEXT        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT        NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "productId" TEXT        NOT NULL REFERENCES "products"(id) ON DELETE CASCADE,
  quantity    INTEGER     NOT NULL DEFAULT 1,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("userId", "productId")
);

-- ── orders ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "orders" (
  id            TEXT          NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"      TEXT          NOT NULL REFERENCES "users"(id),
  "sessionId"   TEXT          NOT NULL REFERENCES "sessions"(id),
  "totalPoints" INTEGER       NOT NULL DEFAULT 0,
  status        "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

-- Add updatedAt to orders if it somehow already exists without it
ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW();

-- ── order_items ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "order_items" (
  id            TEXT        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "orderId"     TEXT        NOT NULL REFERENCES "orders"(id) ON DELETE CASCADE,
  "productId"   TEXT        NOT NULL REFERENCES "products"(id),
  quantity      INTEGER     NOT NULL DEFAULT 1,
  "pointsPrice" INTEGER     NOT NULL,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── tokens ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "tokens" (
  id          TEXT        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT        NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  token       TEXT        NOT NULL UNIQUE,
  type        "TokenType" NOT NULL,
  "expiresAt" TIMESTAMPTZ NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── profiles ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "profiles" (
  id          TEXT        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT        NOT NULL UNIQUE REFERENCES "users"(id) ON DELETE CASCADE,
  "avatarUrl" TEXT,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── suggestions ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "suggestions" (
  id          TEXT        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"    TEXT        NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "sessionId" TEXT        NOT NULL REFERENCES "sessions"(id) ON DELETE CASCADE,
  title       TEXT        NOT NULL,
  description TEXT        NOT NULL,
  "voteCount" INTEGER     NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── suggestion_votes ─────────────────────────────────────────
CREATE TABLE IF NOT EXISTS "suggestion_votes" (
  id             TEXT        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"       TEXT        NOT NULL REFERENCES "users"(id) ON DELETE CASCADE,
  "suggestionId" TEXT        NOT NULL REFERENCES "suggestions"(id) ON DELETE CASCADE,
  "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE ("userId", "suggestionId")
);

-- ── Indexes ───────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_usp_user      ON "user_session_points"("userId");
CREATE INDEX IF NOT EXISTS idx_usp_session   ON "user_session_points"("sessionId");
CREATE INDEX IF NOT EXISTS idx_products_sess ON "products"("sessionId");
CREATE INDEX IF NOT EXISTS idx_orders_user   ON "orders"("userId");
CREATE INDEX IF NOT EXISTS idx_orders_sess   ON "orders"("sessionId");
CREATE INDEX IF NOT EXISTS idx_oi_order      ON "order_items"("orderId");
CREATE INDEX IF NOT EXISTS idx_oi_product    ON "order_items"("productId");
CREATE INDEX IF NOT EXISTS idx_tokens_token  ON "tokens"(token);
CREATE INDEX IF NOT EXISTS idx_tokens_user   ON "tokens"("userId");
CREATE INDEX IF NOT EXISTS idx_sugg_user     ON "suggestions"("userId");
CREATE INDEX IF NOT EXISTS idx_sugg_sess     ON "suggestions"("sessionId");
CREATE INDEX IF NOT EXISTS idx_sv_user       ON "suggestion_votes"("userId");
CREATE INDEX IF NOT EXISTS idx_sv_sugg       ON "suggestion_votes"("suggestionId");
