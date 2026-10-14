import { Prisma } from '../../generated/prisma-client/index.js';
import { prisma } from '../db.js';

const PUBLISHED_ZONE_FILTER = Object.freeze({ isPublished: true, archivedAt: null });
const BY_ORDER_ASC = Object.freeze({ order: Prisma.SortOrder.asc });

export const contentRepository = {
  findPublishedZonesWithLevels() {
    return prisma.zone.findMany({
      where: PUBLISHED_ZONE_FILTER,
      orderBy: BY_ORDER_ASC,
      select: {
        id: true,
        slug: true,
        name: true,
        description: true,
        order: true,
        levels: {
          where: { isPublished: true },
          orderBy: BY_ORDER_ASC,
          select: { id: true, order: true, title: true },
        },
      },
    });
  },

  findPublishedLevelForPlayer(levelId) {
    return prisma.level.findFirst({
      where: { id: levelId, isPublished: true, zone: PUBLISHED_ZONE_FILTER },
      select: {
        id: true,
        order: true,
        title: true,
        initialLives: true,
        zone: { select: { id: true, slug: true, name: true } },
        challenges: {
          orderBy: BY_ORDER_ASC,
          select: {
            id: true,
            order: true,
            type: true,
            language: true,
            statement: true,
            payload: true,
          },
        },
      },
    });
  },

  findPublishedZoneTheory(zoneId) {
    return prisma.zone.findFirst({
      where: { id: zoneId, ...PUBLISHED_ZONE_FILTER },
      select: { id: true, name: true, videoUrl: true, theorySummary: true },
    });
  },

  async findPublishedLevelSummary(levelId) {
    const [levelSummary] = await prisma.$queryRaw`
      SELECT
        level.id AS "levelId",
        level.zone_id AS "zoneId",
        level.initial_lives AS "initialLives",
        COALESCE(
          (SELECT array_agg(challenge.id ORDER BY challenge."order")
             FROM challenges challenge
            WHERE challenge.level_id = level.id),
          '{}'
        ) AS "challengeIds",
        (SELECT json_build_object('levelId', next_level.id, 'zoneId', next_level.zone_id)
           FROM levels next_level
           JOIN zones next_zone ON next_zone.id = next_level.zone_id
          WHERE next_level.is_published
            AND next_zone.is_published
            AND next_zone.archived_at IS NULL
            AND (next_zone."order", next_level."order") > (zone."order", level."order")
          ORDER BY next_zone."order", next_level."order"
          LIMIT 1
        ) AS "nextLevel"
      FROM levels level
      JOIN zones zone ON zone.id = level.zone_id
      WHERE level.id = ${levelId}::uuid
        AND level.is_published
        AND zone.is_published
        AND zone.archived_at IS NULL
    `;
    return levelSummary;
  },

  findChallengeWithSolution(challengeId) {
    return prisma.challenge.findUnique({
      where: { id: challengeId },
      select: {
        id: true,
        levelId: true,
        type: true,
        language: true,
        payload: true,
        solution: true,
        explanation: true,
        commonErrors: true,
      },
    });
  },
};
