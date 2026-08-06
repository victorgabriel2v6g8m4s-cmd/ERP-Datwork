-- CreateTable
CREATE TABLE "pricing_settings" (
    "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'GLOBAL_CONFIG',
    "maxProductionCap" REAL NOT NULL DEFAULT 1000,
    "marginCategoryA" REAL NOT NULL DEFAULT 50,
    "marginCategoryB" REAL NOT NULL DEFAULT 30,
    "marginCategoryC" REAL NOT NULL DEFAULT 20,
    "updatedAt" DATETIME NOT NULL
);
