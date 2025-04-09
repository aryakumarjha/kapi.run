/*
  Warnings:

  - Added the required column `basePrice` to the `Item` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Item" ADD COLUMN     "basePrice" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "AddonSelection" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "addonId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "groupId" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AddonSelection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AddonSelection" ADD CONSTRAINT "AddonSelection_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
