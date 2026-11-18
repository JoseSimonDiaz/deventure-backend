import { logger } from '@deventure/service-kit';
import { PrismaClient } from '../generated/prisma-client/index.js';
import { logicZone } from './seeds/01-logica-basica.js';
import { csharpZone } from './seeds/02-csharp-basico.js';
import { oopZone } from './seeds/03-poo-csharp.js';
import { sqlZone } from './seeds/04-sql.js';

const prisma = new PrismaClient();

const zonesSeed = JSON.stringify([logicZone, csharpZone, oopZone, sqlZone]);
const ZONE_LANGUAGES = JSON.stringify({ 1: 'pseudo', 2: 'csharp', 3: 'csharp', 4: 'sql' });

const upsertZones = prisma.$executeRaw`
  INSERT INTO zones (
    id, slug, name, description, "order", video_url, theory_summary, is_published, updated_at
  )
  SELECT
    ('10000000-0000-4000-8000-' || lpad(zone_seed."order"::text, 12, '0'))::uuid,
    zone_seed.slug, zone_seed.name, zone_seed.description, zone_seed."order",
    zone_seed."videoUrl", zone_seed."theorySummary", true, now()
  FROM jsonb_to_recordset(${zonesSeed}::jsonb) AS zone_seed(
    "order" int, slug text, name text, description text, "videoUrl" text, "theorySummary" text
  )
  ON CONFLICT (id) DO UPDATE SET
    slug = EXCLUDED.slug,
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    "order" = EXCLUDED."order",
    video_url = EXCLUDED.video_url,
    theory_summary = EXCLUDED.theory_summary,
    is_published = true,
    archived_at = NULL,
    updated_at = now()
`;

const upsertLevels = prisma.$executeRaw`
  INSERT INTO levels (id, zone_id, "order", title, initial_lives, is_published, updated_at)
  SELECT
    ('11000000-0000-4000-8000-'
      || lpad(((zone.data ->> 'order')::int * 100 + level.position)::text, 12, '0'))::uuid,
    ('10000000-0000-4000-8000-' || lpad(zone.data ->> 'order', 12, '0'))::uuid,
    level.position,
    level.data ->> 'title',
    3,
    true,
    now()
  FROM jsonb_array_elements(${zonesSeed}::jsonb) AS zone(data),
       jsonb_array_elements(zone.data -> 'levels') WITH ORDINALITY AS level(data, position)
  ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    "order" = EXCLUDED."order",
    is_published = true,
    updated_at = now()
`;

const upsertChallenges = prisma.$executeRaw`
  INSERT INTO challenges (
    id, level_id, "order", type, language, statement, payload, solution, explanation,
    common_errors, updated_at
  )
  SELECT
    ('12000000-0000-4000-8000-' || lpad(
      (((zone.data ->> 'order')::int * 100 + level.position) * 100 + challenge.position)::text,
      12, '0'))::uuid,
    ('11000000-0000-4000-8000-'
      || lpad(((zone.data ->> 'order')::int * 100 + level.position)::text, 12, '0'))::uuid,
    challenge.position,
    (challenge.data ->> 'type')::challenge_type,
    (${ZONE_LANGUAGES}::jsonb ->> (zone.data ->> 'order'))::challenge_language,
    challenge.data ->> 'statement',
    challenge.data -> 'payload',
    challenge.data -> 'solution',
    challenge.data ->> 'explanation',
    COALESCE(challenge.data -> 'commonErrors', '[]'),
    now()
  FROM jsonb_array_elements(${zonesSeed}::jsonb) AS zone(data),
       jsonb_array_elements(zone.data -> 'levels') WITH ORDINALITY AS level(data, position),
       jsonb_array_elements(level.data -> 'challenges') WITH ORDINALITY AS challenge(data, position)
  ON CONFLICT (id) DO UPDATE SET
    "order" = EXCLUDED."order",
    type = EXCLUDED.type,
    language = EXCLUDED.language,
    statement = EXCLUDED.statement,
    payload = EXCLUDED.payload,
    solution = EXCLUDED.solution,
    explanation = EXCLUDED.explanation,
    common_errors = EXCLUDED.common_errors,
    updated_at = now()
`;

const upsertHints = prisma.$executeRaw`
  INSERT INTO hints (id, challenge_id, "order", text)
  SELECT
    gen_random_uuid(),
    ('12000000-0000-4000-8000-' || lpad(
      (((zone.data ->> 'order')::int * 100 + level.position) * 100 + challenge.position)::text,
      12, '0'))::uuid,
    hint.position,
    hint.text
  FROM jsonb_array_elements(${zonesSeed}::jsonb) AS zone(data),
       jsonb_array_elements(zone.data -> 'levels') WITH ORDINALITY AS level(data, position),
       jsonb_array_elements(level.data -> 'challenges') WITH ORDINALITY AS challenge(data, position),
       jsonb_array_elements_text(challenge.data -> 'hints') WITH ORDINALITY AS hint(text, position)
  ON CONFLICT (challenge_id, "order") DO UPDATE SET text = EXCLUDED.text
`;

async function seedContent() {
  const [zonesCount, levelsCount, challengesCount, hintsCount] = await prisma.$transaction([
    upsertZones,
    upsertLevels,
    upsertChallenges,
    upsertHints,
  ]);
  logger.info(
    `Seed content: ${zonesCount} zonas, ${levelsCount} niveles, ${challengesCount} desafíos, ${hintsCount} pistas`,
  );
}

seedContent()
  .catch((seedError) => {
    logger.error({ err: seedError }, 'Falló el seed de content');
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
