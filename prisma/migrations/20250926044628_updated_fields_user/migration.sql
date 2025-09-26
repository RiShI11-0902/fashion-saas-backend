/*
  Warnings:

  - You are about to drop the column `allowedGenerate` on the `User` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "public"."User" DROP COLUMN "allowedGenerate",
ADD COLUMN     "oneTimeCredits" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "subscriptionCredits" INTEGER;
