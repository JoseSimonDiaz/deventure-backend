import { prisma } from '../db.js';

export const progressRepository = {
  findPlayer(userId) {
    return prisma.player.findUnique({ where: { userId }, select: { userId: true } });
  },

  createPlayerWithFirstLevel(userId, firstLevelId) {
    return prisma.$transaction([
      prisma.player.upsert({ where: { userId }, update: {}, create: { userId } }),
      prisma.unlockedLevel.upsert({
        where: { userId_levelId: { userId, levelId: firstLevelId } },
        update: {},
        create: { userId, levelId: firstLevelId },
      }),
    ]);
  },

  async isLevelUnlocked(userId, levelId) {
    const unlockedLevel = await prisma.unlockedLevel.findUnique({
      where: { userId_levelId: { userId, levelId } },
      select: { levelId: true },
    });
    return Boolean(unlockedLevel);
  },

  findProcessedCompletion(sessionId) {
    return prisma.processedCompletion.findUnique({
      where: { sessionId },
      select: { response: true },
    });
  },

  async saveLevelCompletion({ completion, nextLevel, zoneLevelIds }) {
    const [savedCompletion] = await prisma.$queryRaw`
      WITH previous AS (
        SELECT best_stars, best_duration_ms
          FROM level_progress
         WHERE user_id = ${completion.userId}::uuid
           AND level_id = ${completion.levelId}::uuid
      ),
      upserted AS (
        INSERT INTO level_progress AS current (
          user_id, level_id, zone_id, best_stars, best_lives_left, best_duration_ms,
          total_duration_ms, attempts_count, first_completed_at, last_played_at
        )
        VALUES (
          ${completion.userId}::uuid, ${completion.levelId}::uuid, ${completion.zoneId}::uuid,
          ${completion.stars}, ${completion.livesLeft}, ${completion.durationMs},
          ${completion.durationMs}, 1, ${completion.completedAt}::timestamptz,
          ${completion.completedAt}::timestamptz
        )
        ON CONFLICT (user_id, level_id) DO UPDATE SET
          best_stars = GREATEST(current.best_stars, EXCLUDED.best_stars),
          best_lives_left = CASE
            WHEN EXCLUDED.best_stars > current.best_stars
              OR (EXCLUDED.best_stars = current.best_stars
                  AND EXCLUDED.best_duration_ms < current.best_duration_ms)
            THEN EXCLUDED.best_lives_left ELSE current.best_lives_left END,
          best_duration_ms = CASE
            WHEN EXCLUDED.best_stars > current.best_stars
              OR (EXCLUDED.best_stars = current.best_stars
                  AND EXCLUDED.best_duration_ms < current.best_duration_ms)
            THEN EXCLUDED.best_duration_ms ELSE current.best_duration_ms END,
          total_duration_ms = current.total_duration_ms + EXCLUDED.total_duration_ms,
          attempts_count = current.attempts_count + 1,
          last_played_at = EXCLUDED.last_played_at
        RETURNING best_stars
      ),
      played_day AS (
        INSERT INTO play_days (user_id, day)
        VALUES (${completion.userId}::uuid, (${completion.completedAt}::timestamptz)::date)
        ON CONFLICT DO NOTHING
      ),
      unlocked AS (
        INSERT INTO unlocked_levels (user_id, level_id)
        SELECT ${completion.userId}::uuid, ${nextLevel.levelId}::uuid
         WHERE ${nextLevel.levelId}::uuid IS NOT NULL
        ON CONFLICT DO NOTHING
        RETURNING level_id
      ),
      other_zone_levels AS (
        SELECT best_stars
          FROM level_progress
         WHERE user_id = ${completion.userId}::uuid
           AND level_id = ANY(${zoneLevelIds}::uuid[])
           AND level_id <> ${completion.levelId}::uuid
      ),
      zone_completion AS (
        SELECT (SELECT count(*) FROM other_zone_levels) + 1
                 = cardinality(${zoneLevelIds}::uuid[]) AS is_completed
      ),
      result AS (
        SELECT
          (NOT EXISTS (SELECT 1 FROM previous)
            OR EXISTS (
              SELECT 1 FROM previous
               WHERE ${completion.stars} > previous.best_stars
                  OR (${completion.stars} = previous.best_stars
                      AND ${completion.durationMs} < previous.best_duration_ms)
            )) AS "isNewBest",
          COALESCE((SELECT array_agg(level_id) FROM unlocked), '{}') AS "unlockedLevelIds",
          CASE
            WHEN EXISTS (SELECT 1 FROM unlocked)
             AND ${nextLevel.zoneId}::uuid <> ${completion.zoneId}::uuid
            THEN ${nextLevel.zoneId}::uuid
          END AS "unlockedZoneId",
          (SELECT is_completed FROM zone_completion) AS "zoneCompleted",
          ((SELECT is_completed FROM zone_completion)
            AND NOT EXISTS (SELECT 1 FROM other_zone_levels WHERE best_stars < 3)
            AND (SELECT best_stars FROM upserted) = 3) AS "zonePerfect",
          (COALESCE((
            SELECT sum(best_stars)
              FROM level_progress
             WHERE user_id = ${completion.userId}::uuid
               AND level_id <> ${completion.levelId}::uuid), 0)
            + (SELECT best_stars FROM upserted))::int AS "totalStars"
      ),
      processed AS (
        INSERT INTO processed_completions (session_id, user_id, response)
        SELECT ${completion.sessionId}::uuid, ${completion.userId}::uuid, to_jsonb(result)
          FROM result
        RETURNING response
      )
      SELECT response FROM processed
    `;
    return savedCompletion.response;
  },

  async findPlayerProgress(userId) {
    const [playerProgress] = await prisma.$queryRaw`
      SELECT
        COALESCE((
          SELECT json_agg(json_build_object(
                   'levelId', level_id,
                   'zoneId', zone_id,
                   'bestStars', best_stars,
                   'attemptsCount', attempts_count,
                   'lastPlayedAt', last_played_at
                 ) ORDER BY first_completed_at)
            FROM level_progress
           WHERE user_id = ${userId}::uuid
        ), '[]') AS completed,
        COALESCE((
          SELECT array_agg(level_id ORDER BY unlocked_at)
            FROM unlocked_levels
           WHERE user_id = ${userId}::uuid
        ), '{}') AS "unlockedLevelIds",
        COALESCE((
          SELECT sum(best_stars)::int FROM level_progress WHERE user_id = ${userId}::uuid
        ), 0) AS "totalStars"
    `;
    return playerProgress;
  },

  async findPlayerSummary(userId, zonesStructure) {
    const [playerSummary] = await prisma.$queryRaw`
      WITH structure AS (
        SELECT
          (zone ->> 'zoneId')::uuid AS zone_id,
          zone ->> 'name' AS zone_name,
          zone ->> 'slug' AS zone_slug,
          (zone ->> 'order')::int AS zone_order,
          (level ->> 'levelId')::uuid AS level_id,
          (level ->> 'order')::int AS level_order,
          level ->> 'title' AS level_title
        FROM jsonb_array_elements(${JSON.stringify(zonesStructure)}::jsonb) AS zone,
             jsonb_array_elements(zone -> 'levels') AS level
      ),
      player_levels AS (
        SELECT
          structure.*,
          progress.best_stars,
          progress.attempts_count,
          progress.last_played_at,
          COALESCE(progress.total_duration_ms, 0) AS total_duration_ms,
          CASE
            WHEN progress.level_id IS NOT NULL THEN 'completed'
            WHEN unlocked.level_id IS NOT NULL THEN 'available'
            ELSE 'locked'
          END AS status
        FROM structure
        LEFT JOIN level_progress progress
          ON progress.user_id = ${userId}::uuid AND progress.level_id = structure.level_id
        LEFT JOIN unlocked_levels unlocked
          ON unlocked.user_id = ${userId}::uuid AND unlocked.level_id = structure.level_id
      ),
      zone_totals AS (
        SELECT
          zone_id,
          zone_name,
          zone_slug,
          zone_order,
          bool_or(status <> 'locked') AS unlocked,
          count(*) FILTER (WHERE status = 'completed')::int AS levels_completed,
          count(*)::int AS levels_total,
          COALESCE(sum(best_stars), 0)::int AS stars,
          json_agg(json_build_object(
            'levelId', level_id,
            'order', level_order,
            'title', level_title,
            'status', status,
            'bestStars', best_stars,
            'attemptsCount', attempts_count,
            'lastPlayedAt', last_played_at
          ) ORDER BY level_order) AS levels
        FROM player_levels
        GROUP BY zone_id, zone_name, zone_slug, zone_order
      ),
      days AS (
        SELECT day, day - (ROW_NUMBER() OVER (ORDER BY day))::int AS streak_group
          FROM play_days
         WHERE user_id = ${userId}::uuid
      ),
      current_streak AS (
        SELECT streak_group FROM days WHERE day >= current_date - 1 ORDER BY day DESC LIMIT 1
      ),
      totals AS (
        SELECT
          count(*) FILTER (WHERE status = 'completed')::int AS levels_completed,
          count(*)::int AS levels_total,
          COALESCE(sum(best_stars), 0)::int AS stars,
          COALESCE(sum(total_duration_ms), 0)::int AS total_time_ms
        FROM player_levels
      )
      SELECT
        json_build_object(
          'percent', CASE WHEN totals.levels_total = 0 THEN 0
                          ELSE round(100.0 * totals.levels_completed / totals.levels_total)::int END,
          'stars', totals.stars,
          'maxStars', totals.levels_total * 3,
          'levelsCompleted', totals.levels_completed,
          'levelsTotal', totals.levels_total,
          'streakDays', (
            SELECT count(*)::int FROM days
             WHERE streak_group = (SELECT streak_group FROM current_streak)
          ),
          'totalTimeMs', totals.total_time_ms,
          'gameCompleted', totals.levels_total > 0
                           AND totals.levels_completed = totals.levels_total
        ) AS totals,
        COALESCE((
          SELECT json_agg(json_build_object(
                   'zoneId', zone_id,
                   'name', zone_name,
                   'slug', zone_slug,
                   'unlocked', unlocked,
                   'percent', round(100.0 * levels_completed / levels_total)::int,
                   'stars', stars,
                   'maxStars', levels_total * 3,
                   'levelsCompleted', levels_completed,
                   'levelsTotal', levels_total,
                   'levels', levels
                 ) ORDER BY zone_order)
            FROM zone_totals
        ), '[]') AS zones
      FROM totals
    `;
    return playerSummary;
  },

  async findPlayerAchievements(userId, zonesStructure) {
    const [playerAchievements] = await prisma.$queryRaw`
      WITH structure AS (
        SELECT (zone ->> 'zoneId')::uuid AS zone_id, (level ->> 'levelId')::uuid AS level_id
          FROM jsonb_array_elements(${JSON.stringify(zonesStructure)}::jsonb) AS zone,
               jsonb_array_elements(zone -> 'levels') AS level
      ),
      zone_results AS (
        SELECT
          structure.zone_id,
          bool_and(progress.level_id IS NOT NULL) AS is_completed,
          bool_and(COALESCE(progress.best_stars, 0) = 3) AS is_perfect
        FROM structure
        LEFT JOIN level_progress progress
          ON progress.user_id = ${userId}::uuid AND progress.level_id = structure.level_id
        GROUP BY structure.zone_id
      )
      SELECT
        COALESCE((
          SELECT array_agg(level_id::text) FROM level_progress WHERE user_id = ${userId}::uuid
        ), '{}') AS "completedLevelIds",
        COALESCE((
          SELECT array_agg(zone_id::text) FROM zone_results WHERE is_completed
        ), '{}') AS "completedZoneIds",
        COALESCE((
          SELECT array_agg(zone_id::text) FROM zone_results WHERE is_perfect
        ), '{}') AS "perfectZoneIds",
        COALESCE((
          SELECT sum(best_stars)::int FROM level_progress WHERE user_id = ${userId}::uuid
        ), 0) AS "totalStars"
    `;
    return playerAchievements;
  },

  async findSeenTheoryZoneIds(userId) {
    const [seenTheory] = await prisma.$queryRaw`
      SELECT COALESCE(array_agg(zone_id ORDER BY seen_at), '{}') AS "zoneIds"
        FROM theory_views
       WHERE user_id = ${userId}::uuid
    `;
    return seenTheory;
  },

  markTheorySeen(userId, zoneId) {
    return prisma.theoryView.upsert({
      where: { userId_zoneId: { userId, zoneId } },
      update: {},
      create: { userId, zoneId },
    });
  },

  deletePlayerData(userId) {
    return prisma.$transaction([
      prisma.levelProgress.deleteMany({ where: { userId } }),
      prisma.unlockedLevel.deleteMany({ where: { userId } }),
      prisma.theoryView.deleteMany({ where: { userId } }),
      prisma.playDay.deleteMany({ where: { userId } }),
      prisma.processedCompletion.deleteMany({ where: { userId } }),
      prisma.player.deleteMany({ where: { userId } }),
    ]);
  },

  async findCompletionStats({ from, to }) {
    const [completionStats] = await prisma.$queryRaw`
      SELECT
        COALESCE((
          SELECT json_agg(level_stats)
            FROM (
              SELECT
                level_id AS "levelId",
                count(*)::int AS "playersCompleted",
                round(avg(best_duration_ms))::int AS "avgBestDurationMs",
                round(avg(best_stars), 2)::float AS "avgBestStars"
              FROM level_progress
              WHERE first_completed_at BETWEEN ${from} AND ${to}
              GROUP BY level_id
            ) AS level_stats
        ), '[]') AS levels,
        (SELECT count(DISTINCT user_id)::int
           FROM play_days
          WHERE day BETWEEN ${from}::date AND ${to}::date) AS "activePlayers"
    `;
    return completionStats;
  },
};
