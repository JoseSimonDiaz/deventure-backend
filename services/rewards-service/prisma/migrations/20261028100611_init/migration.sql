-- CreateEnum
CREATE TYPE "reward_type" AS ENUM ('art', 'character', 'avatar', 'template');

-- CreateEnum
CREATE TYPE "reward_rarity" AS ENUM ('common', 'rare', 'epic');

-- CreateEnum
CREATE TYPE "reward_rule_type" AS ENUM ('level_completed', 'zone_completed', 'zone_perfect', 'total_stars');

-- CreateTable
CREATE TABLE "rewards" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "slug" VARCHAR(60) NOT NULL,
    "name" VARCHAR(80) NOT NULL,
    "description" TEXT NOT NULL,
    "type" "reward_type" NOT NULL,
    "rarity" "reward_rarity" NOT NULL,
    "image_url" VARCHAR(300) NOT NULL,
    "silhouette_url" VARCHAR(300) NOT NULL,
    "rule_type" "reward_rule_type" NOT NULL,
    "rule_value" JSONB NOT NULL,
    "order" INTEGER NOT NULL,

    CONSTRAINT "rewards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "player_rewards" (
    "user_id" UUID NOT NULL,
    "reward_id" UUID NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "seen" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "player_rewards_pkey" PRIMARY KEY ("user_id","reward_id")
);

-- CreateTable
CREATE TABLE "processed_evaluations" (
    "session_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "response" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_evaluations_pkey" PRIMARY KEY ("session_id")
);

-- CreateIndex
CREATE UNIQUE INDEX "rewards_slug_key" ON "rewards"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "rewards_order_key" ON "rewards"("order");

-- CreateIndex
CREATE INDEX "processed_evaluations_user_id_idx" ON "processed_evaluations"("user_id");

-- AddForeignKey
ALTER TABLE "player_rewards" ADD CONSTRAINT "player_rewards_reward_id_fkey" FOREIGN KEY ("reward_id") REFERENCES "rewards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
