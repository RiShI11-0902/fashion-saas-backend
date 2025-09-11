/*
  Warnings:

  - Added the required column `discount` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "public"."Product" ADD COLUMN     "discount" INTEGER NOT NULL;
