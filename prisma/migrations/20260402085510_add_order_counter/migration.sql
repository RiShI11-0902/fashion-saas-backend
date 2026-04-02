/*
  Warnings:

  - A unique constraint covering the columns `[storeId,orderNumber]` on the table `Order` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "public"."Order_orderNumber_key";

-- AlterTable
ALTER TABLE "public"."Order" ADD COLUMN     "orderCounter" INTEGER NOT NULL DEFAULT 0,
ALTER COLUMN "orderNumber" DROP DEFAULT;
DROP SEQUENCE "Order_orderNumber_seq";

-- CreateIndex
CREATE UNIQUE INDEX "Order_storeId_orderNumber_key" ON "public"."Order"("storeId", "orderNumber");
