-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_pricing_settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'GLOBAL_CONFIG',
    "maxProductionCap" REAL NOT NULL DEFAULT 1000,
    "marginCategoryA" REAL NOT NULL DEFAULT 50,
    "marginCategoryB" REAL NOT NULL DEFAULT 30,
    "marginCategoryC" REAL NOT NULL DEFAULT 20,
    "updatedAt" DATETIME NOT NULL,
    "enableAutoABC" BOOLEAN NOT NULL DEFAULT false
);
INSERT INTO "new_pricing_settings" ("id", "marginCategoryA", "marginCategoryB", "marginCategoryC", "maxProductionCap", "updatedAt") SELECT "id", "marginCategoryA", "marginCategoryB", "marginCategoryC", "maxProductionCap", "updatedAt" FROM "pricing_settings";
DROP TABLE "pricing_settings";
ALTER TABLE "new_pricing_settings" RENAME TO "pricing_settings";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
