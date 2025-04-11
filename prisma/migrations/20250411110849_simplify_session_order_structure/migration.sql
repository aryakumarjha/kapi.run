/*
  Warnings:

  - You are about to drop the column `variants` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the `AddonSelection` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Item` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Reaction` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VariantSelection` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "AddonSelection" DROP CONSTRAINT "AddonSelection_itemId_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "Item" DROP CONSTRAINT "Item_userId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_itemId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_sessionId_fkey";

-- DropForeignKey
ALTER TABLE "Reaction" DROP CONSTRAINT "Reaction_userId_fkey";

-- DropForeignKey
ALTER TABLE "VariantSelection" DROP CONSTRAINT "VariantSelection_itemId_fkey";

-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "variants";

-- DropTable
DROP TABLE "AddonSelection";

-- DropTable
DROP TABLE "Item";

-- DropTable
DROP TABLE "Reaction";

-- DropTable
DROP TABLE "VariantSelection";
