import { SEED_CONTENT_IDS } from '@deventure/contracts';
import { logger } from '@deventure/service-kit';
import {
  ChallengeLanguage,
  ChallengeType,
  PrismaClient,
} from '../generated/prisma-client/index.js';

const prisma = new PrismaClient();

const logicZone = {
  id: SEED_CONTENT_IDS.logicZone,
  slug: 'logica-basica',
  name: 'Lógica básica',
  description: 'Tus primeros pasos: qué es un programa, variables, tipos, operadores y decisiones.',
  order: 1,
  videoUrl: null,
  theorySummary:
    'Un programa es una lista de instrucciones que la computadora sigue en orden, como una receta. Si cambiás el orden, cambia el resultado.',
  isPublished: true,
};

const whatIsAProgramLevel = {
  id: SEED_CONTENT_IDS.whatIsAProgramLevel,
  zoneId: SEED_CONTENT_IDS.logicZone,
  order: 1,
  title: '¿Qué es un programa?',
  initialLives: 3,
  isPublished: true,
};

const variablesLevel = {
  id: SEED_CONTENT_IDS.variablesLevel,
  zoneId: SEED_CONTENT_IDS.logicZone,
  order: 2,
  title: 'Variables',
  initialLives: 3,
  isPublished: true,
};

const programDefinitionChallenge = {
  id: SEED_CONTENT_IDS.programDefinitionChallenge,
  levelId: SEED_CONTENT_IDS.whatIsAProgramLevel,
  order: 1,
  type: ChallengeType.multiple_choice,
  language: ChallengeLanguage.pseudo,
  statement: '¿Qué es un programa?',
  payload: {
    options: [
      { id: 'instructions', text: 'Una lista de instrucciones que la computadora sigue en orden' },
      { id: 'screen', text: 'La pantalla de la computadora' },
      { id: 'internet', text: 'Una página de internet' },
    ],
  },
  solution: { correctOptionId: 'instructions' },
  explanation:
    'Un programa es una lista de instrucciones. La computadora las ejecuta una por una, en el orden en que están escritas.',
};

const instructionOrderChallenge = {
  id: SEED_CONTENT_IDS.instructionOrderChallenge,
  levelId: SEED_CONTENT_IDS.whatIsAProgramLevel,
  order: 2,
  type: ChallengeType.multiple_choice,
  language: ChallengeLanguage.pseudo,
  statement:
    'Björn quiere zarpar con su barco. ¿Cuál es el orden correcto?\n1. Subir al barco\n2. Remar\n3. Desatar la cuerda',
  payload: {
    options: [
      { id: 'one-three-two', text: '1, 3, 2' },
      { id: 'two-one-three', text: '2, 1, 3' },
      { id: 'one-two-three', text: '1, 2, 3' },
    ],
  },
  solution: { correctOptionId: 'one-three-two' },
  explanation:
    'Primero sube al barco, después desata la cuerda y recién ahí puede remar. En un programa el orden de las instrucciones importa.',
};

const variableDefinitionChallenge = {
  id: SEED_CONTENT_IDS.variableDefinitionChallenge,
  levelId: SEED_CONTENT_IDS.variablesLevel,
  order: 1,
  type: ChallengeType.multiple_choice,
  language: ChallengeLanguage.pseudo,
  statement: '¿Para qué sirve una variable?',
  payload: {
    options: [
      { id: 'store-value', text: 'Para guardar un dato y usarlo después' },
      { id: 'turn-off', text: 'Para apagar la computadora' },
    ],
  },
  solution: { correctOptionId: 'store-value' },
  explanation:
    'Una variable es como un cofre con nombre: guardás un dato (la edad de un vikingo, su puntaje) y lo usás cuando lo necesitás.',
};

const upsertById = (modelName, data) =>
  prisma[modelName].upsert({ where: { id: data.id }, update: data, create: data });

const upsertHint = (challengeId, order, text) =>
  prisma.hint.upsert({
    where: { challengeId_order: { challengeId, order } },
    update: { text },
    create: { challengeId, order, text },
  });

async function seedContent() {
  await prisma.$transaction([
    upsertById('zone', logicZone),
    upsertById('level', whatIsAProgramLevel),
    upsertById('level', variablesLevel),
    upsertById('challenge', programDefinitionChallenge),
    upsertById('challenge', instructionOrderChallenge),
    upsertById('challenge', variableDefinitionChallenge),
    upsertHint(programDefinitionChallenge.id, 1, 'Pensá en una receta de cocina.'),
    upsertHint(programDefinitionChallenge.id, 2, 'Una receta es una lista de pasos en orden.'),
    upsertHint(instructionOrderChallenge.id, 1, '¿Se puede remar si el barco sigue atado?'),
    upsertHint(variableDefinitionChallenge.id, 1, 'Pensá en un cofre con una etiqueta.'),
  ]);
  logger.info(`Seed content: zona ${logicZone.slug} con 2 niveles y 3 desafíos`);
}

seedContent()
  .catch((seedError) => {
    logger.error({ err: seedError }, 'Falló el seed de content');
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
