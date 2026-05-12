-- Drop and cleanly recreate orders tables so columns match schema exactly
DROP TABLE IF EXISTS "order_items" CASCADE;
DROP TABLE IF EXISTS "orders" CASCADE;

CREATE TABLE "orders" (
  id            TEXT          NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "userId"      TEXT          NOT NULL REFERENCES "users"(id),
  "sessionId"   TEXT          NOT NULL REFERENCES "sessions"(id),
  "totalPoints" INTEGER       NOT NULL DEFAULT 0,
  status        "OrderStatus" NOT NULL DEFAULT 'PENDING',
  "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
);

CREATE TABLE "order_items" (
  id            TEXT        NOT NULL PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "orderId"     TEXT        NOT NULL REFERENCES "orders"(id) ON DELETE CASCADE,
  "productId"   TEXT        NOT NULL REFERENCES "products"(id),
  quantity      INTEGER     NOT NULL DEFAULT 1,
  "pointsPrice" INTEGER     NOT NULL,
  "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_orders_user ON "orders"("userId");
CREATE INDEX IF NOT EXISTS idx_orders_sess ON "orders"("sessionId");
CREATE INDEX IF NOT EXISTS idx_oi_order    ON "order_items"("orderId");
CREATE INDEX IF NOT EXISTS idx_oi_product  ON "order_items"("productId");
