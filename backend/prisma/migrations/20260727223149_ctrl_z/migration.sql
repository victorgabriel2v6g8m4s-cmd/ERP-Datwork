/*
  Warnings:

  - You are about to drop the `agenda_order_positions` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `agenda_order_profiles` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "agenda_order_positions";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "agenda_order_profiles";
PRAGMA foreign_keys=on;
