-- CreateTable
CREATE TABLE "players" (
    "user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "players_pkey" PRIMARY KEY ("user_id")
);

-- CreateTable
CREATE TABLE "level_progress" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "zone_id" UUID NOT NULL,
    "best_stars" INTEGER NOT NULL,
    "best_lives_left" INTEGER NOT NULL,
    "best_duration_ms" INTEGER NOT NULL,
    "total_duration_ms" BIGINT NOT NULL,
    "attempts_count" INTEGER NOT NULL DEFAULT 1,
    "first_completed_at" TIMESTAMP(3) NOT NULL,
    "last_played_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "level_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unlocked_levels" (
    "user_id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "unlocked_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "unlocked_levels_pkey" PRIMARY KEY ("user_id","level_id")
);

-- CreateTable
CREATE TABLE "theory_views" (
    "user_id" UUID NOT NULL,
    "zone_id" UUID NOT NULL,
    "seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "theory_views_pkey" PRIMARY KEY ("user_id","zone_id")
);

-- CreateTable
CREATE TABLE "play_days" (
    "user_id" UUID NOT NULL,
    "day" DATE NOT NULL,

    CONSTRAINT "play_days_pkey" PRIMARY KEY ("user_id","day")
);

-- CreateTable
CREATE TABLE "processed_completions" (
    "session_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "response" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "processed_completions_pkey" PRIMARY KEY ("session_id")
);

-- CreateIndex
CREATE INDEX "level_progress_level_id_idx" ON "level_progress"("level_id");

-- CreateIndex
CREATE UNIQUE INDEX "level_progress_user_id_level_id_key" ON "level_progress"("user_id", "level_id");

-- CreateIndex
CREATE INDEX "processed_completions_user_id_idx" ON "processed_completions"("user_id");

-- CreateIndex
CREATE INDEX "processed_completions_created_at_idx" ON "processed_completions"("created_at");
