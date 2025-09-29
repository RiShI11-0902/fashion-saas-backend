/*
  Warnings:

  - You are about to drop the column `product` on the `Feedback` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."Feedback" DROP COLUMN "product",
ADD COLUMN     "productName" TEXT;
