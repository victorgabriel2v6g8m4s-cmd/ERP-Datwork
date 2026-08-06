-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_products" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "variation" TEXT,
    "batchCost" REAL NOT NULL,
    "unitsPerBatch" INTEGER NOT NULL,
    "productionCost" REAL NOT NULL,
    "totalUnitCost" REAL NOT NULL,
    "abcCategory" TEXT NOT NULL,
    "thumbnail" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "position" INTEGER NOT NULL,
    "finalPrice" REAL DEFAULT 0,
    "includeFixedCosts" TEXT NOT NULL DEFAULT 'DEFAULT',
    "salePrice" REAL NOT NULL DEFAULT 0.0,
    "stockQuantity" INTEGER NOT NULL DEFAULT 0,
    "salesQuantity" INTEGER NOT NULL DEFAULT 0,
    "rating" REAL NOT NULL DEFAULT 0.0,
    "reviews" TEXT,
    "offers" TEXT,
    "medias" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_products" ("abcCategory", "batchCost", "brand", "createdAt", "description", "id", "medias", "name", "offers", "position", "productionCost", "rating", "reviews", "salePrice", "salesQuantity", "sku", "status", "stockQuantity", "thumbnail", "totalUnitCost", "unitsPerBatch", "updatedAt", "variation") SELECT "abcCategory", "batchCost", "brand", "createdAt", "description", "id", "medias", "name", "offers", "position", "productionCost", "rating", "reviews", "salePrice", "salesQuantity", "sku", "status", "stockQuantity", "thumbnail", "totalUnitCost", "unitsPerBatch", "updatedAt", "variation" FROM "products";
DROP TABLE "products";
ALTER TABLE "new_products" RENAME TO "products";
CREATE UNIQUE INDEX "products_sku_key" ON "products"("sku");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
