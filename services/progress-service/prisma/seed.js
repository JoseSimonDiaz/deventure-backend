import { SEED_USER_IDS } from '@deventure/contracts';
import { logger } from '@deventure/service-kit';
import { PrismaClient } from '../generated/prisma-client/index.js';

const prisma = new PrismaClient();

const SEEDED_LEVELS_PER_ZONE = JSON.stringify([
  { zoneOrder: 1, levelsCount: 5 },
  { zoneOrder: 2, levelsCount: 6 },
  { zoneOrder: 3, levelsCount: 6 },
  { zoneOrder: 4, levelsCount: 7 },
]);
const CHAMPION_LEVEL_DURATION_MS = 95000;

const championLevels = prisma.$executeRaw`
  WITH champion_levels AS (
    SELECT
      ('11000000-0000-4000-8000-'
        || lpad((zone_seed."zoneOrder" * 100 + level_order)::text, 12, '0'))::uuid AS level_id,
      ('10000000-0000-4000-8000-' || lpad(zone_seed."zoneOrder"::text, 12, '0'))::uuid AS zone_id
    FROM jsonb_to_recordset(${SEEDED_LEVELS_PER_ZONE}::jsonb)
           AS zone_seed("zoneOrder" int, "levelsCount" int),
         generate_series(1, zone_seed."levelsCount") AS level_order
  )
  INSERT INTO level_progress (
    user_id, level_id, zone_id, best_stars, best_lives_left, best_duration_ms,
    total_duration_ms, attempts_count, first_completed_at, last_played_at
  )
  SELECT ${SEED_USER_IDS.champion}::uuid, level_id, zone_id, 3, 3,
         ${CHAMPION_LEVEL_DURATION_MS}, ${CHAMPION_LEVEL_DURATION_MS}, 1, now(), now()
    FROM champion_levels
  ON CONFLICT (user_id, level_id) DO NOTHING
`;

const championUnlocks = prisma.$executeRaw`
  INSERT INTO unlocked_levels (user_id, level_id)
  SELECT user_id, level_id FROM level_progress WHERE user_id = ${SEED_USER_IDS.champion}::uuid
  ON CONFLICT DO NOTHING
`;

const championPlayer = prisma.player.upsert({
  where: { userId: SEED_USER_IDS.champion },
  update: {},
  create: { userId: SEED_USER_IDS.champion },
});

const championPlayDay = prisma.$executeRaw`
  INSERT INTO play_days (user_id, day) VALUES (${SEED_USER_IDS.champion}::uuid, current_date)
  ON CONFLICT DO NOTHING
`;

async function seedProgress() {
  await prisma.$transaction([championPlayer, championLevels, championUnlocks, championPlayDay]);
  logger.info('Seed progress: usuario campeon con todos los niveles en 3 estrellas');
}

seedProgress()
  .catch((seedError) => {
    logger.error({ err: seedError }, 'Falló el seed de progress');
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
