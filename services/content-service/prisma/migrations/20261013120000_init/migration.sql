-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "challenge_type" AS ENUM ('multiple_choice', 'order_blocks', 'fill_code', 'find_bug', 'predict_output');

-- CreateEnum
CREATE TYPE "challenge_language" AS ENUM ('pseudo', 'csharp', 'sql');

-- CreateTable
CREATE TABLE "zones" (
    "id" UUID NOT NULL,
    "slug" VARCHAR(50) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "description" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "video_url" VARCHAR(500),
    "theory_summary" TEXT NOT NULL,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "archived_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "zones_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "levels" (
    "id" UUID NOT NULL,
    "zone_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "title" VARCHAR(120) NOT NULL,
    "initial_lives" INTEGER NOT NULL DEFAULT 3,
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "levels_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenges" (
    "id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "type" "challenge_type" NOT NULL,
    "language" "challenge_language" NOT NULL,
    "statement" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "solution" JSONB NOT NULL,
    "explanation" TEXT NOT NULL,
    "common_errors" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hints" (
    "id" UUID NOT NULL,
    "challenge_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "text" TEXT NOT NULL,

    CONSTRAINT "hints_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "zones_slug_key" ON "zones"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "zones_order_key" ON "zones"("order");

-- CreateIndex
CREATE UNIQUE INDEX "levels_zone_id_order_key" ON "levels"("zone_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "challenges_level_id_order_key" ON "challenges"("level_id", "order");

-- CreateIndex
CREATE UNIQUE INDEX "hints_challenge_id_order_key" ON "hints"("challenge_id", "order");

-- AddForeignKey
ALTER TABLE "levels" ADD CONSTRAINT "levels_zone_id_fkey" FOREIGN KEY ("zone_id") REFERENCES "zones"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenges" ADD CONSTRAINT "challenges_level_id_fkey" FOREIGN KEY ("level_id") REFERENCES "levels"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hints" ADD CONSTRAINT "hints_challenge_id_fkey" FOREIGN KEY ("challenge_id") REFERENCES "challenges"("id") ON DELETE CASCADE ON UPDATE CASCADE;

