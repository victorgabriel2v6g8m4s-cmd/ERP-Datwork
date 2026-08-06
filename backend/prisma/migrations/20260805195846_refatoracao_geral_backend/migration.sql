/*
  Warnings:

  - You are about to drop the `Product` table. If the table is not empty, all the data it contains will be lost.
  - You are about to alter the column `financials` on the `appointments` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `medias` on the `appointments` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `positions` on the `custom_order_profiles` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `snapshotData` on the `expense_versions` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `snapshotData` on the `ingredient_versions` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `medias` on the `ingredients` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.
  - You are about to alter the column `snapshotData` on the `product_versions` table. The data in that column could be lost. The data in that column will be cast from `String` to `Json`.

*/
-- DropIndex
DROP INDEX "Product_sku_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Product";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "variation" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "abcCategory" TEXT NOT NULL DEFAULT 'C',
    "thumbnail" TEXT,
    "medias" JSONB,
    "recipeCostPerUnit" REAL NOT NULL DEFAULT 0,
    "indirectCost" REAL NOT NULL DEFAULT 0,
    "totalUnitCost" REAL NOT NULL DEFAULT 0,
    "suggestedPrice" REAL NOT NULL DEFAULT 0,
    "finalPrice" REAL NOT NULL DEFAULT 0,
    "predictedNetProfit" REAL NOT NULL DEFAULT 0,
    "includeFixedCosts" TEXT NOT NULL DEFAULT 'DEFAULT',
    "position" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_appointments" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "time" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "subStatus" TEXT,
    "description" TEXT,
    "medias" JSONB,
    "financials" JSONB,
    "firstName" TEXT,
    "lastName" TEXT,
    "documentType" TEXT,
    "documentNumber" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "cep" TEXT,
    "state" TEXT,
    "city" TEXT,
    "neighborhood" TEXT,
    "street" TEXT,
    "houseNumber" TEXT,
    "complement" TEXT,
    "referencePoint" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_appointments" ("cep", "city", "complement", "createdAt", "description", "documentNumber", "documentType", "email", "financials", "firstName", "houseNumber", "id", "lastName", "medias", "neighborhood", "phone", "position", "referencePoint", "state", "status", "street", "subStatus", "time", "title", "updatedAt") SELECT "cep", "city", "complement", "createdAt", "description", "documentNumber", "documentType", "email", "financials", "firstName", "houseNumber", "id", "lastName", "medias", "neighborhood", "phone", "position", "referencePoint", "state", "status", "street", "subStatus", "time", "title", "updatedAt" FROM "appointments";
DROP TABLE "appointments";
ALTER TABLE "new_appointments" RENAME TO "appointments";
CREATE INDEX "appointments_status_createdAt_idx" ON "appointments"("status", "createdAt");
CREATE TABLE "new_custom_order_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "positions" JSONB NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_custom_order_profiles" ("createdAt", "id", "name", "positions", "updatedAt") SELECT "createdAt", "id", "name", "positions", "updatedAt" FROM "custom_order_profiles";
DROP TABLE "custom_order_profiles";
ALTER TABLE "new_custom_order_profiles" RENAME TO "custom_order_profiles";
CREATE TABLE "new_expense_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "snapshotData" JSONB NOT NULL,
    "versionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_expense_versions" ("id", "snapshotData", "versionDate") SELECT "id", "snapshotData", "versionDate" FROM "expense_versions";
DROP TABLE "expense_versions";
ALTER TABLE "new_expense_versions" RENAME TO "expense_versions";
CREATE TABLE "new_ingredient_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ingredientId" TEXT NOT NULL,
    "snapshotData" JSONB NOT NULL,
    "versionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ingredient_versions_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "ingredients" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ingredient_versions" ("id", "ingredientId", "snapshotData", "versionDate") SELECT "id", "ingredientId", "snapshotData", "versionDate" FROM "ingredient_versions";
DROP TABLE "ingredient_versions";
ALTER TABLE "new_ingredient_versions" RENAME TO "ingredient_versions";
CREATE INDEX "ingredient_versions_ingredientId_idx" ON "ingredient_versions"("ingredientId");
CREATE TABLE "new_ingredients" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" REAL NOT NULL,
    "quantity" REAL NOT NULL,
    "unit" TEXT NOT NULL,
    "thumbnail" TEXT,
    "medias" JSONB,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "position" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_ingredients" ("createdAt", "id", "medias", "name", "position", "price", "quantity", "sku", "status", "thumbnail", "unit", "updatedAt") SELECT "createdAt", "id", "medias", "name", "position", "price", "quantity", "sku", "status", "thumbnail", "unit", "updatedAt" FROM "ingredients";
DROP TABLE "ingredients";
ALTER TABLE "new_ingredients" RENAME TO "ingredients";
CREATE UNIQUE INDEX "ingredients_sku_key" ON "ingredients"("sku");
CREATE INDEX "ingredients_status_idx" ON "ingredients"("status");
CREATE TABLE "new_product_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "snapshotData" JSONB NOT NULL,
    "versionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_versions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_product_versions" ("id", "productId", "snapshotData", "versionDate") SELECT "id", "productId", "snapshotData", "versionDate" FROM "product_versions";
DROP TABLE "product_versions";
ALTER TABLE "new_product_versions" RENAME TO "product_versions";
CREATE INDEX "product_versions_productId_idx" ON "product_versions"("productId");
CREATE TABLE "new_recipes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "position" INTEGER NOT NULL,
    "unitsPerBatch" INTEGER NOT NULL DEFAULT 1,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "recipes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "products" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_recipes" ("createdAt", "id", "position", "productId", "status", "unitsPerBatch", "updatedAt") SELECT "createdAt", "id", "position", "productId", "status", "unitsPerBatch", "updatedAt" FROM "recipes";
DROP TABLE "recipes";
ALTER TABLE "new_recipes" RENAME TO "recipes";
CREATE UNIQUE INDEX "recipes_productId_key" ON "recipes"("productId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");

-- CreateIndex
CREATE INDEX "products_status_abcCategory_idx" ON "products"("status", "abcCategory");

-- CreateIndex
CREATE INDEX "expenses_category_status_idx" ON "expenses"("category", "status");

-- CreateIndex
CREATE INDEX "recipe_items_recipeId_idx" ON "recipe_items"("recipeId");

-- CreateIndex
CREATE INDEX "recipe_items_ingredientId_idx" ON "recipe_items"("ingredientId");
