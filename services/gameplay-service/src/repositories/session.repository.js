import { Prisma, SessionStatus } from '../../generated/prisma-client/index.js';
import { prisma } from '../db.js';

const PUBLIC_SESSION_SELECT = Object.freeze({
  id: true,
  userId: true,
  levelId: true,
  zoneId: true,
  challengeIds: true,
  currentIndex: true,
  initialLives: true,
  livesLeft: true,
  hintsUsed: true,
  status: true,
  startedAt: true,
  lastAttemptAt: true,
});

export const sessionRepository = {
  create(sessionData) {
    return prisma.gameSession.create({ data: sessionData, select: PUBLIC_SESSION_SELECT });
  },

  findById(sessionId) {
    return prisma.gameSession.findUnique({
      where: { id: sessionId },
      select: PUBLIC_SESSION_SELECT,
    });
  },

  findLatestInProgress({ userId, levelId, startedAfter }) {
    return prisma.gameSession.findFirst({
      where: {
        userId,
        levelId,
        status: SessionStatus.in_progress,
        startedAt: { gt: startedAfter },
      },
      orderBy: { startedAt: Prisma.SortOrder.desc },
      select: PUBLIC_SESSION_SELECT,
    });
  },

  async abandonInProgress(sessionId) {
    const { count } = await prisma.gameSession.updateMany({
      where: { id: sessionId, status: SessionStatus.in_progress },
      data: { status: SessionStatus.abandoned, finishedAt: new Date() },
    });
    return count;
  },

  async applyAttempt({ session, challengeId, answer, isCorrect, now }) {
    const [appliedAttempt] = await prisma.$queryRaw`
      WITH updated AS (
        UPDATE game_sessions SET
          current_index = CASE WHEN ${isCorrect} THEN current_index + 1 ELSE current_index END,
          lives_left = CASE WHEN ${isCorrect} THEN lives_left ELSE lives_left - 1 END,
          status = (CASE
            WHEN ${isCorrect} AND current_index + 1 >= cardinality(challenge_ids) THEN 'won'
            WHEN NOT ${isCorrect} AND lives_left - 1 <= 0 THEN 'lost'
            ELSE 'in_progress'
          END)::session_status,
          stars = CASE
            WHEN ${isCorrect} AND current_index + 1 >= cardinality(challenge_ids) THEN lives_left
          END,
          finished_at = CASE
            WHEN (${isCorrect} AND current_index + 1 >= cardinality(challenge_ids))
              OR (NOT ${isCorrect} AND lives_left - 1 <= 0)
            THEN ${now}::timestamp
          END,
          duration_ms = CASE
            WHEN (${isCorrect} AND current_index + 1 >= cardinality(challenge_ids))
              OR (NOT ${isCorrect} AND lives_left - 1 <= 0)
            THEN GREATEST(1, (extract(epoch FROM (${now}::timestamp - started_at)) * 1000)::int)
          END,
          last_attempt_at = ${now}::timestamp
        WHERE id = ${session.id}::uuid
          AND status = 'in_progress'
          AND current_index = ${session.currentIndex}
          AND lives_left = ${session.livesLeft}
        RETURNING *
      ),
      saved_attempt AS (
        INSERT INTO attempts (session_id, challenge_id, challenge_index, answer, is_correct, created_at)
        SELECT id, ${challengeId}::uuid, ${session.currentIndex}, ${JSON.stringify(answer)}::jsonb,
               ${isCorrect}, ${now}::timestamp
          FROM updated
      )
      SELECT
        updated.id AS "sessionId",
        updated.user_id AS "userId",
        updated.level_id AS "levelId",
        updated.zone_id AS "zoneId",
        updated.lives_left AS "livesLeft",
        updated.current_index AS "currentIndex",
        updated.status::text AS status,
        updated.stars,
        updated.duration_ms AS "durationMs",
        updated.hints_used AS "hintsUsed",
        updated.finished_at AS "finishedAt",
        updated.next_level_id AS "nextLevelId",
        updated.is_last_of_zone AS "isLastOfZone",
        cardinality(updated.challenge_ids) AS total,
        ((SELECT count(*)
            FROM attempts correct_attempt
           WHERE correct_attempt.session_id = updated.id
             AND correct_attempt.is_correct
             AND NOT EXISTS (
               SELECT 1 FROM attempts wrong_attempt
                WHERE wrong_attempt.session_id = correct_attempt.session_id
                  AND wrong_attempt.challenge_index = correct_attempt.challenge_index
                  AND NOT wrong_attempt.is_correct))
          + CASE
              WHEN ${isCorrect} AND NOT EXISTS (
                SELECT 1 FROM attempts wrong_attempt
                 WHERE wrong_attempt.session_id = updated.id
                   AND wrong_attempt.challenge_index = ${session.currentIndex}
                   AND NOT wrong_attempt.is_correct)
              THEN 1 ELSE 0
            END)::int AS "correctFirstTry"
      FROM updated
    `;
    return appliedAttempt;
  },

  async countHintRequests(sessionId, challengeId) {
    return prisma.hintRequest.count({ where: { sessionId, challengeId } });
  },

  async saveHintRequest({ sessionId, challengeId, order }) {
    const [, updatedSession] = await prisma.$transaction([
      prisma.hintRequest.create({ data: { sessionId, challengeId, order } }),
      prisma.gameSession.update({
        where: { id: sessionId },
        data: { hintsUsed: { increment: 1 } },
        select: { hintsUsed: true },
      }),
    ]);
    return updatedSession;
  },

  async abandonStartedBefore(limitDate) {
    const { count } = await prisma.gameSession.updateMany({
      where: { status: SessionStatus.in_progress, startedAt: { lt: limitDate } },
      data: { status: SessionStatus.abandoned, finishedAt: new Date() },
    });
    return count;
  },

  deleteUserData(userId) {
    return prisma.$transaction([
      prisma.pendingInternalCall.deleteMany({ where: { userId } }),
      prisma.gameSession.deleteMany({ where: { userId } }),
    ]);
  },

  async findLevelStats({ from, to }) {
    const [levelStats] = await prisma.$queryRaw`
      SELECT
        COALESCE((
          SELECT json_agg(level_stats ORDER BY level_stats."failRate" DESC)
            FROM (
              SELECT
                level_id AS "levelId",
                count(DISTINCT user_id)::int AS "playersStarted",
                count(DISTINCT user_id) FILTER (WHERE status = 'won')::int AS "playersWon",
                count(*)::int AS sessions,
                COALESCE(round(100.0 * count(*) FILTER (WHERE status = 'lost')
                  / NULLIF(count(*) FILTER (WHERE status IN ('won', 'lost')), 0)), 0)::int AS "failRate",
                COALESCE(round(avg(duration_ms) FILTER (WHERE status = 'won')), 0)::int AS "avgDurationMs"
              FROM game_sessions
              WHERE started_at BETWEEN ${from} AND ${to}
              GROUP BY level_id
            ) AS level_stats
        ), '[]') AS levels,
        COALESCE((
          SELECT json_agg(challenge_stats)
            FROM (
              SELECT
                attempt.challenge_id AS "challengeId",
                min(session.level_id::text)::uuid AS "levelId",
                (min(attempt.challenge_index) + 1)::int AS "challengeNumber",
                count(*) FILTER (WHERE NOT attempt.is_correct)::int AS errors,
                count(*)::int AS attempts
              FROM attempts attempt
              JOIN game_sessions session ON session.id = attempt.session_id
              WHERE attempt.created_at BETWEEN ${from} AND ${to}
              GROUP BY attempt.challenge_id
              HAVING count(*) FILTER (WHERE NOT attempt.is_correct) > 0
              ORDER BY errors DESC
              LIMIT 10
            ) AS challenge_stats
        ), '[]') AS "topFailedChallenges"
    `;
    return levelStats;
  },
};
