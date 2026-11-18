-- CreateEnum
CREATE TYPE "session_status" AS ENUM ('in_progress', 'won', 'lost', 'abandoned');

-- CreateEnum
CREATE TYPE "internal_target" AS ENUM ('progress', 'rewards');

-- CreateEnum
CREATE TYPE "http_method" AS ENUM ('POST', 'DELETE');

-- CreateEnum
CREATE TYPE "pending_call_status" AS ENUM ('pending', 'done', 'failed');

-- CreateTable
CREATE TABLE "game_sessions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "user_id" UUID NOT NULL,
    "level_id" UUID NOT NULL,
    "zone_id" UUID NOT NULL,
    "challenge_ids" UUID[],
    "current_index" INTEGER NOT NULL DEFAULT 0,
    "initial_lives" INTEGER NOT NULL,
    "lives_left" INTEGER NOT NULL,
    "hints_used" INTEGER NOT NULL DEFAULT 0,
    "status" "session_status" NOT NULL DEFAULT 'in_progress',
    "stars" INTEGER,
    "duration_ms" INTEGER,
    "next_level_id" UUID,
    "is_last_of_zone" BOOLEAN NOT NULL,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_attempt_at" TIMESTAMP(3),
    "finished_at" TIMESTAMP(3),

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attempts" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "session_id" UUID NOT NULL,
    "challenge_id" UUID NOT NULL,
    "challenge_index" INTEGER NOT NULL,
    "answer" JSONB NOT NULL,
    "is_correct" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hint_requests" (
    "session_id" UUID NOT NULL,
    "challenge_id" UUID NOT NULL,
    "order" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "hint_requests_pkey" PRIMARY KEY ("session_id","challenge_id","order")
);

-- CreateTable
CREATE TABLE "pending_internal_calls" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "target" "internal_target" NOT NULL,
    "method" "http_method" NOT NULL,
    "path" VARCHAR(255) NOT NULL,
    "body" JSONB,
    "session_id" UUID NOT NULL,
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
CREATE INDEX "game_sessions_user_id_level_id_idx" ON "game_sessions"("user_id", "level_id");

-- CreateIndex
CREATE INDEX "game_sessions_status_started_at_idx" ON "game_sessions"("status", "started_at");

-- CreateIndex
CREATE INDEX "game_sessions_level_id_status_idx" ON "game_sessions"("level_id", "status");

-- CreateIndex
CREATE INDEX "attempts_session_id_challenge_index_idx" ON "attempts"("session_id", "challenge_index");

-- CreateIndex
CREATE INDEX "attempts_challenge_id_is_correct_idx" ON "attempts"("challenge_id", "is_correct");

-- CreateIndex
CREATE INDEX "pending_internal_calls_status_next_retry_at_idx" ON "pending_internal_calls"("status", "next_retry_at");

-- CreateIndex
CREATE INDEX "pending_internal_calls_user_id_idx" ON "pending_internal_calls"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "pending_internal_calls_target_session_id_key" ON "pending_internal_calls"("target", "session_id");

-- AddForeignKey
ALTER TABLE "attempts" ADD CONSTRAINT "attempts_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hint_requests" ADD CONSTRAINT "hint_requests_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "game_sessions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Normaliza código antes de comparar (RN-24): unifica saltos de línea, colapsa espacios, quita
-- espacios alrededor de signos y, en SQL, pasa todo a mayúsculas y quita el ; final opcional.
CREATE OR REPLACE FUNCTION normalize_code(source TEXT, code_language TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT CASE
           WHEN code_language = 'sql' THEN regexp_replace(upper(compacted), ';$', '')
           ELSE compacted
         END
    FROM (
      SELECT btrim(
               regexp_replace(
                 regexp_replace(
                   regexp_replace(
                     regexp_replace(single_line, ' {2,}', ' ', 'g'),
                     ' ?([][;,(){}=<>!+*/%&|:-]) ?', '\1', 'g'),
                   ' ?\n ?', E'\n', 'g'),
                 '\n{2,}', E'\n', 'g'),
               E' \n') AS compacted
        FROM (
          SELECT CASE
                   WHEN code_language = 'sql' THEN replace(unified, E'\n', ' ')
                   ELSE unified
                 END AS single_line
            FROM (SELECT replace(replace(source, E'\r\n', E'\n'), E'\t', ' ') AS unified) AS step_unified
        ) AS step_single_line
    ) AS step_compacted
$$;

-- Escapa los caracteres especiales para usar un token como parte literal de una regex
CREATE OR REPLACE FUNCTION escape_regex(source TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT regexp_replace(source, '([].^$*+?(){}|\\[])', '\\\1', 'g')
$$;

-- Normaliza la salida de predict_output: ignora espacios al final de cada línea y líneas vacías finales
CREATE OR REPLACE FUNCTION normalize_output(source TEXT)
RETURNS TEXT
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT regexp_replace(
           regexp_replace(replace(source, E'\r\n', E'\n'), '[ \t]+(\n|$)', '\1', 'g'),
           '\n+$', '')
$$;
