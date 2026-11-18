import { randomUUID } from 'node:crypto';
import {
  evaluationRequestSchema,
  levelCompletionResultSchema,
  levelCompletionSchema,
  rewardEvaluationSchema,
} from '@deventure/contracts';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { completeLevel } from '../../src/services/levelCompletion.service.js';

const unlockedLevelId = randomUUID();

const progressResponse = levelCompletionResultSchema.parse({
  isNewBest: true,
  unlockedLevelIds: [unlockedLevelId],
  unlockedZoneId: null,
  zoneCompleted: false,
  zonePerfect: false,
  totalStars: 3,
});

const rewardsResponse = rewardEvaluationSchema.parse({
  unlocked: [
    {
      id: randomUUID(),
      name: 'Hacha de Björn',
      type: 'art',
      rarity: 'rare',
      imageUrl: '/rewards/axe.webp',
    },
  ],
});

const PROVIDER_RESPONSES = new Map([
  ['/internal/level-completions', progressResponse],
  ['/internal/evaluations', rewardsResponse],
]);

function buildWonSession() {
  return {
    sessionId: randomUUID(),
    userId: randomUUID(),
    levelId: randomUUID(),
    zoneId: randomUUID(),
    stars: 2,
    livesLeft: 2,
    hintsUsed: 1,
    durationMs: 61000,
    finishedAt: new Date(),
    correctFirstTry: 4,
    total: 5,
    nextLevelId: unlockedLevelId,
    isLastOfZone: false,
  };
}

describe('contrato gameplay-service como consumidor de progress y rewards', () => {
  afterEach(() => vi.unstubAllGlobals());

  it('envía cuerpos válidos y arma el resultado con las respuestas de los proveedores', async () => {
    const sentBodies = new Map();
    vi.stubGlobal(
      'fetch',
      vi.fn(async (url, init) => {
        const { pathname } = new URL(url);
        sentBodies.set(pathname, JSON.parse(init.body));
        return Response.json({ data: PROVIDER_RESPONSES.get(pathname) });
      }),
    );

    const levelResult = await completeLevel(buildWonSession(), randomUUID());

    expect(() =>
      levelCompletionSchema.parse(sentBodies.get('/internal/level-completions')),
    ).not.toThrow();
    expect(() =>
      evaluationRequestSchema.parse(sentBodies.get('/internal/evaluations')),
    ).not.toThrow();
    expect(levelResult).toMatchObject({
      progressSaved: true,
      unlockedLevelIds: [unlockedLevelId],
      rewardsUnlocked: rewardsResponse.unlocked,
      result: { isNewBest: true, stars: 2 },
    });
  });
});
