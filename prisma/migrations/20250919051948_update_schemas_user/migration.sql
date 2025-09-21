/*
  Warnings:

  - The values [AI_ONLY] on the enum `Plan` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `AIPack` table. If the table is not empty, all the data it contains will be lost.
  - Changed the type of `status` on the `Payment` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `Subscription` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "public"."SubscriptionStatus" AS ENUM ('PENDING', 'ACTIVE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "public"."PaymentStatus" AS ENUM ('CREATED', 'CAPTURED', 'FAILED');

-- AlterEnum
BEGIN;
CREATE TYPE "public"."Plan_new" AS ENUM ('FREE', 'PREMIUM');
ALTER TABLE "public"."User" ALTER COLUMN "plan" TYPE "public"."Plan_new" USING ("plan"::text::"public"."Plan_new");
ALTER TABLE "public"."Subscription" ALTER COLUMN "plan" TYPE "public"."Plan_new" USING ("plan"::text::"public"."Plan_new");
ALTER TYPE "public"."Plan" RENAME TO "Plan_old";
ALTER TYPE "public"."Plan_new" RENAME TO "Plan";
DROP TYPE "public"."Plan_old";
COMMIT;

-- DropForeignKey
ALTER TABLE "public"."AIPack" DROP CONSTRAINT "AIPack_subscriptionId_fkey";

-- DropIndex
DROP INDEX "public"."Subscription_userId_key";

-- AlterTable
ALTER TABLE "public"."Payment" DROP COLUMN "status",
ADD COLUMN     "status" "public"."PaymentStatus" NOT NULL;

-- AlterTable
ALTER TABLE "public"."Subscription" DROP COLUMN "status",
ADD COLUMN     "status" "public"."SubscriptionStatus" NOT NULL,
ALTER COLUMN "razorpaySubscriptionId" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."User" ALTER COLUMN "updatedAt" DROP DEFAULT;

-- DropTable
DROP TABLE "public"."AIPack";

-- CreateIndex
CREATE INDEX "Subscription_userId_status_idx" ON "public"."Subscription"("userId", "status");
