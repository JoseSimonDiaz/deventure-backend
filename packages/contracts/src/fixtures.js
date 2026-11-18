export const SEED_USER_IDS = Object.freeze({
  admin: '00000000-0000-4000-8000-000000000001',
  demo: '00000000-0000-4000-8000-000000000002',
  champion: '00000000-0000-4000-8000-000000000003',
});

const SEED_ID_SUFFIX_LENGTH = 12;
const LEVELS_PER_ZONE_SLOT = 100;
const CHALLENGES_PER_LEVEL_SLOT = 100;

const buildSeedId = (prefix, sequence) =>
  `${prefix}-0000-4000-8000-${String(sequence).padStart(SEED_ID_SUFFIX_LENGTH, '0')}`;

export const seedZoneId = (zoneOrder) => buildSeedId('10000000', zoneOrder);

export const seedLevelId = (zoneOrder, levelOrder) =>
  buildSeedId('11000000', zoneOrder * LEVELS_PER_ZONE_SLOT + levelOrder);

export const seedChallengeId = (zoneOrder, levelOrder, challengeOrder) =>
  buildSeedId(
    '12000000',
    (zoneOrder * LEVELS_PER_ZONE_SLOT + levelOrder) * CHALLENGES_PER_LEVEL_SLOT + challengeOrder,
  );

export const seedRewardId = (rewardOrder) => buildSeedId('13000000', rewardOrder);

export const SEED_ZONE_ORDERS = Object.freeze({
  logic: 1,
  csharp: 2,
  oop: 3,
  sql: 4,
});
