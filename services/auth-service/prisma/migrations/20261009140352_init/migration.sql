-- CreateEnum
CREATE TYPE "user_role" AS ENUM ('player', 'admin');

-- CreateEnum
CREATE TYPE "internal_target" AS ENUM ('gameplay', 'progress', 'rewards', 'assistant');

-- CreateEnum
CREATE TYPE "http_method" AS ENUM ('POST', 'DELETE');

-- CreateEnum
CREATE TYPE "pending_call_status" AS ENUM ('pending', 'done', 'failed');

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "username" VARCHAR(20) NOT NULL,
    "username_lower" VARCHAR(20) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "password_hash" VARCHAR(60) NOT NULL,
    "role" "user_role" NOT NULL DEFAULT 'player',
    "intro_seen" BOOLEAN NOT NULL DEFAULT false,
    "avatar_base" VARCHAR(16),
    "avatar_reward_id" UUID,
    "settings" JSONB NOT NULL DEFAULT '{"musicVolume":50,"musicMuted":false,"sfxVolume":70,"sfxMuted":false,"brightness":100}',
    "failed_login_count" INTEGER NOT NULL DEFAULT 0,
    "failed_login_window_start" TIMESTAMP(3),
    "locked_until" TIMESTAMP(3),
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_internal_calls" (
    "id" UUID NOT NULL,
    "target" "internal_target" NOT NULL,
    "method" "http_method" NOT NULL,
    "path" VARCHAR(255) NOT NULL,
    "body" JSONB,
    "user_id" UUID NOT NULL,
    "correlation_id" TEXT,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "next_retry_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_error" TEXT,
    "status" "pending_call_status" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pending_internal_calls_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_username_lower_key" ON "users"("username_lower");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_created_at_idx" ON "users"("role", "created_at");

-- CreateIndex
CREATE INDEX "users_role_last_login_at_idx" ON "users"("role", "last_login_at");

-- CreateIndex
CREATE INDEX "pending_internal_calls_status_next_retry_at_idx" ON "pending_internal_calls"("status", "next_retry_at");

-- CreateIndex
CREATE UNIQUE INDEX "pending_internal_calls_target_user_id_key" ON "pending_internal_calls"("target", "user_id");
