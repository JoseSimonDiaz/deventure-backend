import { randomUUID } from 'node:crypto';
import { evaluationRequestSchema, rewardEvaluationSchema } from '@deventure/contracts';
import { INTERNAL_TOKEN_HEADER } from '@deventure/service-kit';
import request from 'supertest';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../src/app.js';
import { prisma } from '../../src/db.js';

const INTERNAL_TOKEN = 'test-internal-token';
const CONTRACT_LEVEL_ID = '99999999-0000-4000-8000-000000000001';
const CONTRACT_REWARD = {
  slug: 'contract-test-reward',
  name: 'Recompensa de contrato',
  description: 'Se otorga al completar el nivel de prueba',
  type: 'art',
  rarity: 'common',
  imageUrl: '/rewards/contract.webp',
  silhouetteUrl: '/rewards/contract-silhouette.webp',
  ruleType: 'level_completed',
  ruleValue: { levelId: CONTRACT_LEVEL_ID },
  order: 9999,
};

describe('contrato rewards-service /internal', () => {
  const app = buildApp();

  beforeAll(async () => {
    await prisma.reward.upsert({
      where: { slug: CONTRACT_REWARD.slug },
      create: CONTRACT_REWARD,
      update: {},
    });
    const playerAchievements = {
      completedLevelIds: [CONTRACT_LEVEL_ID],
      completedZoneIds: [],
      perfectZoneIds: [],
      totalStars: 3,
    };
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => Response.json({ data: playerAchievements })),
    );
  });

  afterAll(async () => {
    vi.unstubAllGlobals();
    await prisma.$disconnect();
  });

  it('POST /internal/evaluations responde con rewardEvaluationSchema', async () => {
    const evaluationRequest = evaluationRequestSchema.parse({
      sessionId: randomUUID(),
      userId: randomUUID(),
    });

    const response = await request(app)
      .post('/internal/evaluations')
      .set(INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN)
      .send(evaluationRequest);

    expect(response.status).toBe(200);
    const evaluation = rewardEvaluationSchema.parse(response.body.data);
    expect(evaluation.unlocked).toHaveLength(1);
  });

  it('DELETE /internal/users/:userId responde 204', async () => {
    const response = await request(app)
      .delete(`/internal/users/${randomUUID()}`)
      .set(INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN);

    expect(response.status).toBe(204);
  });
});
