ALTER TABLE "custom_order_profiles" ADD COLUMN "scope" TEXT NOT NULL DEFAULT 'PRODUCT';

CREATE INDEX "custom_order_profiles_scope_idx" ON "custom_order_profiles"("scope");
