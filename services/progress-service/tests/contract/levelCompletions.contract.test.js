import { randomUUID } from 'node:crypto';
import { levelCompletionResultSchema, levelCompletionSchema } from '@deventure/contracts';
import { INTERNAL_TOKEN_HEADER } from '@deventure/service-kit';
import request from 'supertest';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildApp } from '../../src/app.js';
import { prisma } from '../../src/db.js';

const INTERNAL_TOKEN = 'test-internal-token';

function buildCompletion() {
  return levelCompletionSchema.parse({
    sessionId: randomUUID(),
    userId: randomUUID(),
    levelId: randomUUID(),
    zoneId: randomUUID(),
    stars: 3,
    livesLeft: 3,
    hintsUsed: 0,
    durationMs: 45000,
    completedAt: new Date().toISOString(),
  });
}

function stubContentLevelSummary(completion) {
  const nextLevelId = randomUUID();
  const levelSummary = {
    nextLevel: { levelId: nextLevelId, zoneId: completion.zoneId },
    zoneLevelIds: [completion.levelId, nextLevelId],
  };
  vi.stubGlobal(
    'fetch',
    vi.fn(async () => Response.json({ data: levelSummary })),
  );
}

describe('contrato progress-service /internal', () => {
  const app = buildApp();

  beforeEach(() => vi.unstubAllGlobals());
  afterAll(() => prisma.$disconnect());

  it('POST /internal/level-completions responde con levelCompletionResultSchema', async () => {
    const completion = buildCompletion();
    stubContentLevelSummary(completion);

    const response = await request(app)
      .post('/internal/level-completions')
      .set(INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN)
      .send(completion);

    expect(response.status).toBe(200);
    const completionResult = levelCompletionResultSchema.parse(response.body.data);
    expect(completionResult.unlockedLevelIds).toHaveLength(1);
  });

  it('POST /internal/level-completions es idempotente por sessionId', async () => {
    const completion = buildCompletion();
    stubContentLevelSummary(completion);
    const sendCompletion = () =>
      request(app)
        .post('/internal/level-completions')
        .set(INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN)
        .send(completion);

    const firstResponse = await sendCompletion();
    const repeatedResponse = await sendCompletion();

    expect(repeatedResponse.body.data).toEqual(firstResponse.body.data);
  });

  it('DELETE /internal/users/:userId responde 204', async () => {
    const response = await request(app)
      .delete(`/internal/users/${randomUUID()}`)
      .set(INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN);

    expect(response.status).toBe(204);
  });

  it('rechaza llamadas sin token interno', async () => {
    const response = await request(app).post('/internal/level-completions').send(buildCompletion());

    expect(response.status).toBe(403);
  });
});
