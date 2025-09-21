-- AlterTable
ALTER TABLE "public"."OrderItem" ALTER COLUMN "size" DROP NOT NULL;

-- AlterTable
ALTER TABLE "public"."Product" ALTER COLUMN "sizes" SET DEFAULT ARRAY[]::TEXT[];
