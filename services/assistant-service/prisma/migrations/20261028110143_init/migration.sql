-- CreateEnum
CREATE TYPE "answer_source" AS ENUM ('ai', 'hint');

-- CreateTable
CREATE TABLE "assistant_queries" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "challenge_id" UUID NOT NULL,
    "query_number" INTEGER NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "source" "answer_source" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "assistant_queries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "assistant_queries_user_id_level_id_query_number_key" ON "assistant_queries"("user_id", "level_id", "query_number");
