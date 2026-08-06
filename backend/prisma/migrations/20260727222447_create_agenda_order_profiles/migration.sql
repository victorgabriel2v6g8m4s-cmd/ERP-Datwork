-- CreateTable
CREATE TABLE "agenda_order_profiles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "agenda_order_positions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "profileId" TEXT NOT NULL,
    "appointmentId" TEXT NOT NULL,
    "position" INTEGER NOT NULL,
    CONSTRAINT "agenda_order_positions_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "agenda_order_profiles" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
