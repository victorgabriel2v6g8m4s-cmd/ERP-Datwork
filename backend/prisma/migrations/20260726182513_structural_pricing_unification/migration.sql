/*
  Warnings:

  - You are about to drop the `products` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropIndex
DROP INDEX "products_sku_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "products";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Product" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT,
    "variation" TEXT,
    "thumbnail" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "abcCategory" TEXT NOT NULL DEFAULT 'C',
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
CREATE TABLE "new_product_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "snapshotData" TEXT NOT NULL,
    "versionDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "product_versions_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_product_versions" ("id", "productId", "snapshotData", "versionDate") SELECT "id", "productId", "snapshotData", "versionDate" FROM "product_versions";
DROP TABLE "product_versions";
ALTER TABLE "new_product_versions" RENAME TO "product_versions";
CREATE TABLE "new_recipes" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "productId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "position" INTEGER NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "recipes_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_recipes" ("createdAt", "id", "position", "productId", "status", "updatedAt") SELECT "createdAt", "id", "position", "productId", "status", "updatedAt" FROM "recipes";
DROP TABLE "recipes";
ALTER TABLE "new_recipes" RENAME TO "recipes";
CREATE UNIQUE INDEX "recipes_productId_key" ON "recipes"("productId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "Product_sku_key" ON "Product"("sku");
