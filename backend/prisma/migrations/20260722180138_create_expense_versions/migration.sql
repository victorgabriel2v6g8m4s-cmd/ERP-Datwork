-- CreateTable
CREATE TABLE "expense_versions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "snapshotData" TEXT NOT NULL,
    "versionDate" DATETIME NOT NULL
);
