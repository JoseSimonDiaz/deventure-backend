import {
  SEED_USER_IDS,
  SEED_ZONE_ORDERS,
  seedLevelId,
  seedRewardId,
  seedZoneId,
} from '@deventure/contracts';
import { logger } from '@deventure/service-kit';
import { PrismaClient, Rarity, RewardType, RuleType } from '../generated/prisma-client/index.js';

const prisma = new PrismaClient();

const imageUrlFor = (slug) => `/rewards/${slug}.svg`;
const silhouetteUrlFor = (type) => `/rewards/silhouettes/${type}.svg`;

const buildReward = ({ order, slug, name, description, type, rarity, ruleType, ruleValue }) => ({
  id: seedRewardId(order),
  order,
  slug,
  name,
  description,
  type,
  rarity,
  imageUrl: imageUrlFor(slug),
  silhouetteUrl: silhouetteUrlFor(type),
  ruleType,
  ruleValue,
});

const rewards = [
  buildReward({
    order: 1,
    slug: 'runa-primer-paso',
    name: 'Runa del primer paso',
    description:
      'Grabada el día en que escribiste tu primer programa. Todo gran viaje empieza así.',
    type: RewardType.art,
    rarity: Rarity.common,
    ruleType: RuleType.level_completed,
    ruleValue: { levelId: seedLevelId(SEED_ZONE_ORDERS.logic, 1) },
  }),
  buildReward({
    order: 2,
    slug: 'avatar-ragnar',
    name: 'Avatar: Ragnar',
    description: 'El jarl curioso que siempre pregunta "¿y si probamos otra cosa?".',
    type: RewardType.avatar,
    rarity: Rarity.common,
    ruleType: RuleType.total_stars,
    ruleValue: { stars: 10 },
  }),
  buildReward({
    order: 3,
    slug: 'escudo-de-la-logica',
    name: 'Escudo de la lógica',
    description: 'Protege contra los errores de razonamiento. Lo ganan quienes dominan la lógica.',
    type: RewardType.avatar,
    rarity: Rarity.rare,
    ruleType: RuleType.zone_completed,
    ruleValue: { zoneId: seedZoneId(SEED_ZONE_ORDERS.logic) },
  }),
  buildReward({
    order: 4,
    slug: 'bjorn-dorado',
    name: 'Björn dorado',
    description: 'Tu guía, bañado en oro. Solo aparece ante quien resolvió la lógica sin errores.',
    type: RewardType.character,
    rarity: Rarity.epic,
    ruleType: RuleType.zone_perfect,
    ruleValue: { zoneId: seedZoneId(SEED_ZONE_ORDERS.logic) },
  }),
  buildReward({
    order: 5,
    slug: 'casco-de-aprendiz',
    name: 'Casco de aprendiz',
    description: 'El casco que se ganan quienes escriben su primer Console.WriteLine.',
    type: RewardType.avatar,
    rarity: Rarity.common,
    ruleType: RuleType.level_completed,
    ruleValue: { levelId: seedLevelId(SEED_ZONE_ORDERS.csharp, 1) },
  }),
  buildReward({
    order: 6,
    slug: 'hacha-runica',
    name: 'Hacha rúnica',
    description: 'Forjada con if, for y métodos. Corta cualquier problema en partes chicas.',
    type: RewardType.art,
    rarity: Rarity.rare,
    ruleType: RuleType.zone_completed,
    ruleValue: { zoneId: seedZoneId(SEED_ZONE_ORDERS.csharp) },
  }),
  buildReward({
    order: 7,
    slug: 'drakkar-de-csharp',
    name: 'Drakkar de C#',
    description: 'El barco más veloz del fiordo: sin un solo error de sintaxis a bordo.',
    type: RewardType.art,
    rarity: Rarity.epic,
    ruleType: RuleType.zone_perfect,
    ruleValue: { zoneId: seedZoneId(SEED_ZONE_ORDERS.csharp) },
  }),
  buildReward({
    order: 8,
    slug: 'plantilla-apuntes-vikingos',
    name: 'Plantilla: apuntes vikingos',
    description: 'Una hoja para tus apuntes de programación, con bordes rúnicos. ¡Descargala!',
    type: RewardType.template,
    rarity: Rarity.rare,
    ruleType: RuleType.total_stars,
    ruleValue: { stars: 30 },
  }),
  buildReward({
    order: 9,
    slug: 'guerrero-de-clases',
    name: 'Guerrero de clases',
    description: 'Hereda la fuerza del Vikingo y la sobrescribe con la suya.',
    type: RewardType.character,
    rarity: Rarity.rare,
    ruleType: RuleType.zone_completed,
    ruleValue: { zoneId: seedZoneId(SEED_ZONE_ORDERS.oop) },
  }),
  buildReward({
    order: 10,
    slug: 'valquiria-polimorfica',
    name: 'Valquiria polimórfica',
    description: 'Cambia de forma según quién la llame. Premio a la POO perfecta.',
    type: RewardType.avatar,
    rarity: Rarity.epic,
    ruleType: RuleType.zone_perfect,
    ruleValue: { zoneId: seedZoneId(SEED_ZONE_ORDERS.oop) },
  }),
  buildReward({
    order: 11,
    slug: 'mapa-de-kattegat',
    name: 'Mapa de Kattegat',
    description: 'Cada aldea es una fila, cada camino una relación. Tu primer mapa de datos.',
    type: RewardType.art,
    rarity: Rarity.common,
    ruleType: RuleType.level_completed,
    ruleValue: { levelId: seedLevelId(SEED_ZONE_ORDERS.sql, 1) },
  }),
  buildReward({
    order: 12,
    slug: 'skald-de-los-datos',
    name: 'Skald de los datos',
    description: 'El poeta que recita consultas SQL como si fueran sagas.',
    type: RewardType.character,
    rarity: Rarity.rare,
    ruleType: RuleType.zone_completed,
    ruleValue: { zoneId: seedZoneId(SEED_ZONE_ORDERS.sql) },
  }),
  buildReward({
    order: 13,
    slug: 'plantilla-tabla-runica',
    name: 'Plantilla: tabla rúnica',
    description: 'Una plantilla para diseñar tus propias tablas. Premio al SQL perfecto.',
    type: RewardType.template,
    rarity: Rarity.epic,
    ruleType: RuleType.zone_perfect,
    ruleValue: { zoneId: seedZoneId(SEED_ZONE_ORDERS.sql) },
  }),
  buildReward({
    order: 14,
    slug: 'avatar-lagertha',
    name: 'Avatar: Lagertha',
    description: 'Estratega y valiente. Para quienes ya juntaron un buen botín de estrellas.',
    type: RewardType.avatar,
    rarity: Rarity.rare,
    ruleType: RuleType.total_stars,
    ruleValue: { stars: 60 },
  }),
  buildReward({
    order: 15,
    slug: 'salon-del-valhalla',
    name: 'Salón del Valhalla',
    description: 'El salón donde descansan las leyendas de la programación.',
    type: RewardType.art,
    rarity: Rarity.epic,
    ruleType: RuleType.total_stars,
    ruleValue: { stars: 90 },
  }),
];

async function seedRewards() {
  await prisma.$executeRaw`
    INSERT INTO rewards (
      id, "order", slug, name, description, type, rarity,
      image_url, silhouette_url, rule_type, rule_value
    )
    SELECT
      seed.id, seed."order", seed.slug, seed.name, seed.description,
      seed.type::reward_type, seed.rarity::reward_rarity,
      seed."imageUrl", seed."silhouetteUrl", seed."ruleType"::reward_rule_type, seed."ruleValue"
    FROM jsonb_to_recordset(${JSON.stringify(rewards)}::jsonb) AS seed(
      id uuid, "order" int, slug text, name text, description text, type text, rarity text,
      "imageUrl" text, "silhouetteUrl" text, "ruleType" text, "ruleValue" jsonb
    )
    ON CONFLICT (id) DO UPDATE SET
      "order" = EXCLUDED."order",
      slug = EXCLUDED.slug,
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      type = EXCLUDED.type,
      rarity = EXCLUDED.rarity,
      image_url = EXCLUDED.image_url,
      silhouette_url = EXCLUDED.silhouette_url,
      rule_type = EXCLUDED.rule_type,
      rule_value = EXCLUDED.rule_value
  `;
  await prisma.$executeRaw`
    INSERT INTO player_rewards (user_id, reward_id, seen)
    SELECT ${SEED_USER_IDS.champion}::uuid, id, true FROM rewards
    ON CONFLICT DO NOTHING
  `;
  logger.info(`Seed rewards: ${rewards.length} recompensas y todas para el usuario campeon`);
}

seedRewards()
  .catch((seedError) => {
    logger.error({ err: seedError }, 'Falló el seed de rewards');
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
