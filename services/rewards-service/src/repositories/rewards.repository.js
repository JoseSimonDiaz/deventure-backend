import { prisma } from '../db.js';

export const rewardsRepository = {
  findProcessedEvaluation(sessionId) {
    return prisma.processedEvaluation.findUnique({
      where: { sessionId },
      select: { response: true },
    });
  },

  async grantEarnedRewards({ sessionId, userId, achievements }) {
    const [evaluation] = await prisma.$queryRaw`
      WITH earned AS (
        SELECT reward.id
          FROM rewards reward
         WHERE (reward.rule_type = 'level_completed'
                AND reward.rule_value ->> 'levelId' = ANY(${achievements.completedLevelIds}::text[]))
            OR (reward.rule_type = 'zone_completed'
                AND reward.rule_value ->> 'zoneId' = ANY(${achievements.completedZoneIds}::text[]))
            OR (reward.rule_type = 'zone_perfect'
                AND reward.rule_value ->> 'zoneId' = ANY(${achievements.perfectZoneIds}::text[]))
            OR (reward.rule_type = 'total_stars'
                AND (reward.rule_value ->> 'stars')::int <= ${achievements.totalStars})
      ),
      granted AS (
        INSERT INTO player_rewards (user_id, reward_id)
        SELECT ${userId}::uuid, earned.id FROM earned
        ON CONFLICT DO NOTHING
        RETURNING reward_id
      ),
      evaluation_response AS (
        SELECT json_build_object(
                 'unlocked',
                 COALESCE(json_agg(json_build_object(
                   'id', reward.id,
                   'name', reward.name,
                   'type', reward.type,
                   'rarity', reward.rarity,
                   'imageUrl', reward.image_url
                 ) ORDER BY reward."order"), '[]')
               )::jsonb AS body
          FROM rewards reward
          JOIN granted ON granted.reward_id = reward.id
      ),
      processed AS (
        INSERT INTO processed_evaluations (session_id, user_id, response)
        SELECT ${sessionId}::uuid, ${userId}::uuid, body FROM evaluation_response
        ON CONFLICT DO NOTHING
      )
      SELECT body AS response FROM evaluation_response
    `;
    return evaluation.response;
  },

  async findPlayerGallery({ userId, type, status, zonesStructure }) {
    const [gallery] = await prisma.$queryRaw`
      WITH structure_levels AS (
        SELECT level ->> 'levelId' AS level_id, level ->> 'title' AS level_title,
               zone ->> 'name' AS zone_name
          FROM jsonb_array_elements(${JSON.stringify(zonesStructure)}::jsonb) AS zone,
               jsonb_array_elements(zone -> 'levels') AS level
      ),
      structure_zones AS (
        SELECT zone ->> 'zoneId' AS zone_id, zone ->> 'name' AS zone_name
          FROM jsonb_array_elements(${JSON.stringify(zonesStructure)}::jsonb) AS zone
      ),
      catalog AS (
        SELECT
          reward.id,
          reward.name,
          reward.description,
          reward.type::text AS type,
          reward.rarity::text AS rarity,
          reward."order",
          owned.user_id IS NOT NULL AS unlocked,
          CASE WHEN owned.user_id IS NOT NULL THEN reward.image_url END AS "imageUrl",
          reward.silhouette_url AS "silhouetteUrl",
          owned.unlocked_at AS "unlockedAt",
          (owned.user_id IS NOT NULL AND NOT owned.seen) AS "isNew",
          CASE reward.rule_type
            WHEN 'level_completed'
              THEN 'Completá el nivel "' || COALESCE(structure_levels.level_title, '?')
                   || '" de ' || COALESCE(structure_levels.zone_name, 'su zona')
            WHEN 'zone_completed'
              THEN 'Completá la zona ' || COALESCE(structure_zones.zone_name, '?')
            WHEN 'zone_perfect'
              THEN 'Conseguí 3 estrellas en todos los niveles de '
                   || COALESCE(structure_zones.zone_name, '?')
            ELSE 'Juntá ' || (reward.rule_value ->> 'stars') || ' estrellas en total'
          END AS "howToUnlock"
        FROM rewards reward
        LEFT JOIN player_rewards owned
          ON owned.reward_id = reward.id AND owned.user_id = ${userId}::uuid
        LEFT JOIN structure_levels ON structure_levels.level_id = reward.rule_value ->> 'levelId'
        LEFT JOIN structure_zones ON structure_zones.zone_id = reward.rule_value ->> 'zoneId'
      )
      SELECT
        COALESCE((
          SELECT json_agg(catalog ORDER BY catalog."order")
            FROM catalog
           WHERE (${type}::text IS NULL OR catalog.type = ${type}::text)
             AND (${status}::text IS NULL
                  OR (${status}::text = 'unlocked') = catalog.unlocked)
        ), '[]') AS rewards,
        (SELECT count(*)::int FROM catalog) AS total,
        (SELECT count(*)::int FROM catalog WHERE unlocked) AS "unlockedCount"
    `;
    return gallery;
  },

  async markSeen(userId, rewardId) {
    const { count } = await prisma.playerReward.updateMany({
      where: { userId, rewardId },
      data: { seen: true },
    });
    return count;
  },

  findOwnedReward(userId, rewardId) {
    return prisma.playerReward.findUnique({
      where: { userId_rewardId: { userId, rewardId } },
      select: { reward: { select: { type: true, imageUrl: true } } },
    });
  },

  deletePlayerData(userId) {
    return prisma.$transaction([
      prisma.playerReward.deleteMany({ where: { userId } }),
      prisma.processedEvaluation.deleteMany({ where: { userId } }),
    ]);
  },
};
