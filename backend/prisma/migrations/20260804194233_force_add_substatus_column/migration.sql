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
    "medias" TEXT,
    "financials" TEXT,
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
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
