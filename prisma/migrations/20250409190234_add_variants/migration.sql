-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "variants" JSONB;

-- CreateTable
CREATE TABLE "VariantSelection" (
    "id" TEXT NOT NULL,
    "itemId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" INTEGER NOT NULL,
    "groupId" TEXT NOT NULL,
    "groupName" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VariantSelection_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "VariantSelection" ADD CONSTRAINT "VariantSelection_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "Item"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
