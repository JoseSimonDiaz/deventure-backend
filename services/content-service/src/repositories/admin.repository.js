import { Prisma } from '../../generated/prisma-client/index.js';
import { prisma } from '../db.js';

const BY_ORDER_ASC = Object.freeze({ order: Prisma.SortOrder.asc });

const ADMIN_ZONE_SELECT = Object.freeze({
  id: true,
  slug: true,
  name: true,
  description: true,
  order: true,
  videoUrl: true,
  theorySummary: true,
  isPublished: true,
  archivedAt: true,
  levels: {
    orderBy: BY_ORDER_ASC,
    select: {
      id: true,
      order: true,
      title: true,
      initialLives: true,
      isPublished: true,
      _count: { select: { challenges: true } },
    },
  },
});

const ADMIN_LEVEL_SELECT = Object.freeze({
  id: true,
  zoneId: true,
  order: true,
  title: true,
  initialLives: true,
  isPublished: true,
});

const AUDIT_ACTIONS = Object.freeze({
  create: 'create',
  update: 'update',
  reorder: 'reorder',
  delete: 'delete',
});

const AUDIT_ENTITIES = Object.freeze({ zone: 'zone', level: 'level', challenge: 'challenge' });

const ADMIN_CHALLENGE_SELECT = Object.freeze({
  id: true,
  levelId: true,
  order: true,
  type: true,
  language: true,
  statement: true,
  payload: true,
  solution: true,
  explanation: true,
  commonErrors: true,
  hints: { orderBy: BY_ORDER_ASC, select: { order: true, text: true } },
});

const writeAuditLog = (transaction, { userId, action, entity, entityId, before, after }) =>
  transaction.auditLog.create({
    data: { userId, action, entity, entityId, before: before ?? undefined, after },
    select: { id: true },
  });

const insertHints = (transaction, challengeId, hints) => transaction.$executeRaw`
  INSERT INTO hints (id, challenge_id, "order", text)
  SELECT gen_random_uuid(), ${challengeId}::uuid, hint.position, hint.text
    FROM jsonb_array_elements_text(${JSON.stringify(hints)}::jsonb)
         WITH ORDINALITY AS hint(text, position)
`;

export const adminRepository = {
  findAllZones() {
    return prisma.zone.findMany({ orderBy: BY_ORDER_ASC, select: ADMIN_ZONE_SELECT });
  },

  createZone(userId, zoneData) {
    return prisma.$transaction(async (transaction) => {
      const { _max: maxOrder } = await transaction.zone.aggregate({ _max: { order: true } });
      const zone = await transaction.zone.create({
        data: { ...zoneData, order: (maxOrder.order ?? 0) + 1 },
        select: ADMIN_ZONE_SELECT,
      });
      await writeAuditLog(transaction, {
        userId,
        action: AUDIT_ACTIONS.create,
        entity: AUDIT_ENTITIES.zone,
        entityId: zone.id,
        after: zone,
      });
      return zone;
    });
  },

  updateZone(userId, zoneId, zoneData) {
    return prisma.$transaction(async (transaction) => {
      const before = await transaction.zone.findUnique({
        where: { id: zoneId },
        select: ADMIN_ZONE_SELECT,
      });
      if (!before) return null;
      const zone = await transaction.zone.update({
        where: { id: zoneId },
        data: zoneData,
        select: ADMIN_ZONE_SELECT,
      });
      await writeAuditLog(transaction, {
        userId,
        action: AUDIT_ACTIONS.update,
        entity: AUDIT_ENTITIES.zone,
        entityId: zoneId,
        before,
        after: zone,
      });
      return zone;
    });
  },

  createLevel(userId, zoneId, levelData) {
    return prisma.$transaction(async (transaction) => {
      const { _max: maxOrder } = await transaction.level.aggregate({
        where: { zoneId },
        _max: { order: true },
      });
      const level = await transaction.level.create({
        data: { ...levelData, zoneId, order: (maxOrder.order ?? 0) + 1 },
        select: ADMIN_LEVEL_SELECT,
      });
      await writeAuditLog(transaction, {
        userId,
        action: AUDIT_ACTIONS.create,
        entity: AUDIT_ENTITIES.level,
        entityId: level.id,
        after: level,
      });
      return level;
    });
  },

  updateLevel(userId, levelId, levelData) {
    return prisma.$transaction(async (transaction) => {
      const before = await transaction.level.findUnique({
        where: { id: levelId },
        select: ADMIN_LEVEL_SELECT,
      });
      if (!before) return null;
      const level = await transaction.level.update({
        where: { id: levelId },
        data: levelData,
        select: ADMIN_LEVEL_SELECT,
      });
      await writeAuditLog(transaction, {
        userId,
        action: AUDIT_ACTIONS.update,
        entity: AUDIT_ENTITIES.level,
        entityId: levelId,
        before,
        after: level,
      });
      return level;
    });
  },

  reorderLevels(userId, zoneId, levelIds) {
    return prisma.$transaction(async (transaction) => {
      const [levelMatch] = await transaction.$queryRaw`
        SELECT
          (SELECT count(*) FROM levels WHERE zone_id = ${zoneId}::uuid)::int AS "zoneLevels",
          (SELECT count(*) FROM levels
            WHERE zone_id = ${zoneId}::uuid AND id = ANY(${levelIds}::uuid[]))::int AS "matchedLevels",
          cardinality(${levelIds}::uuid[]) AS "requestedLevels"
      `;
      const isSameSet =
        levelMatch.zoneLevels === levelMatch.matchedLevels &&
        levelMatch.zoneLevels === levelMatch.requestedLevels;
      if (!isSameSet) return null;

      await transaction.$executeRaw`
        UPDATE levels SET "order" = -"order" WHERE zone_id = ${zoneId}::uuid
      `;
      await transaction.$executeRaw`
        UPDATE levels
           SET "order" = new_order.position, updated_at = now()
          FROM unnest(${levelIds}::uuid[]) WITH ORDINALITY AS new_order(level_id, position)
         WHERE levels.id = new_order.level_id
      `;
      await writeAuditLog(transaction, {
        userId,
        action: AUDIT_ACTIONS.reorder,
        entity: AUDIT_ENTITIES.zone,
        entityId: zoneId,
        after: { levelIds },
      });
      return transaction.zone.findUnique({ where: { id: zoneId }, select: ADMIN_ZONE_SELECT });
    });
  },

  findLevelChallenges(levelId) {
    return prisma.level.findUnique({
      where: { id: levelId },
      select: {
        id: true,
        title: true,
        zoneId: true,
        challenges: { orderBy: BY_ORDER_ASC, select: ADMIN_CHALLENGE_SELECT },
      },
    });
  },

  createChallenge(userId, levelId, { hints, ...challengeData }) {
    return prisma.$transaction(async (transaction) => {
      const { _max: maxOrder } = await transaction.challenge.aggregate({
        where: { levelId },
        _max: { order: true },
      });
      const { id: challengeId } = await transaction.challenge.create({
        data: { ...challengeData, levelId, order: (maxOrder.order ?? 0) + 1 },
        select: { id: true },
      });
      await insertHints(transaction, challengeId, hints);
      const challenge = await transaction.challenge.findUnique({
        where: { id: challengeId },
        select: ADMIN_CHALLENGE_SELECT,
      });
      await writeAuditLog(transaction, {
        userId,
        action: AUDIT_ACTIONS.create,
        entity: AUDIT_ENTITIES.challenge,
        entityId: challengeId,
        after: challenge,
      });
      return challenge;
    });
  },

  replaceChallenge(userId, challengeId, { hints, ...challengeData }) {
    return prisma.$transaction(async (transaction) => {
      const before = await transaction.challenge.findUnique({
        where: { id: challengeId },
        select: ADMIN_CHALLENGE_SELECT,
      });
      if (!before) return null;
      await transaction.challenge.update({
        where: { id: challengeId },
        data: challengeData,
        select: { id: true },
      });
      await transaction.hint.deleteMany({ where: { challengeId } });
      await insertHints(transaction, challengeId, hints);
      const challenge = await transaction.challenge.findUnique({
        where: { id: challengeId },
        select: ADMIN_CHALLENGE_SELECT,
      });
      await writeAuditLog(transaction, {
        userId,
        action: AUDIT_ACTIONS.update,
        entity: AUDIT_ENTITIES.challenge,
        entityId: challengeId,
        before,
        after: challenge,
      });
      return challenge;
    });
  },

  deleteChallenge(userId, challengeId) {
    return prisma.$transaction(async (transaction) => {
      const before = await transaction.challenge.findUnique({
        where: { id: challengeId },
        select: ADMIN_CHALLENGE_SELECT,
      });
      if (!before) return null;
      await transaction.challenge.delete({ where: { id: challengeId }, select: { id: true } });
      await writeAuditLog(transaction, {
        userId,
        action: AUDIT_ACTIONS.delete,
        entity: AUDIT_ENTITIES.challenge,
        entityId: challengeId,
        before,
      });
      return before;
    });
  },
};
