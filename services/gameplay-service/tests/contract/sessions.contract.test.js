import { randomUUID } from 'node:crypto';
import { internalSessionSchema } from '@deventure/contracts';
import { INTERNAL_TOKEN_HEADER } from '@deventure/service-kit';
import request from 'supertest';
import { afterAll, describe, expect, it } from 'vitest';
import { buildApp } from '../../src/app.js';
import { prisma } from '../../src/db.js';

const INTERNAL_TOKEN = 'test-internal-token';

describe('contrato gameplay-service /internal', () => {
  const app = buildApp();

  afterAll(() => prisma.$disconnect());

  it('GET /internal/sessions/:sessionId responde con internalSessionSchema', async () => {
    const session = await prisma.gameSession.create({
      data: {
        userId: randomUUID(),
        levelId: randomUUID(),
        zoneId: randomUUID(),
        challengeIds: [randomUUID(), randomUUID()],
        initialLives: 3,
        livesLeft: 3,
        isLastOfZone: false,
      },
    });

    const response = await request(app)
      .get(`/internal/sessions/${session.id}`)
      .set(INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN);

    expect(response.status).toBe(200);
    expect(internalSessionSchema.parse(response.body.data).id).toBe(session.id);
  });

  it('GET /internal/sessions/:sessionId responde 404 si no existe', async () => {
    const response = await request(app)
      .get(`/internal/sessions/${randomUUID()}`)
      .set(INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN);

    expect(response.status).toBe(404);
    expect(response.body.error.code).toBe('SESSION_NOT_FOUND');
  });

  it('DELETE /internal/users/:userId responde 204', async () => {
    const response = await request(app)
      .delete(`/internal/users/${randomUUID()}`)
      .set(INTERNAL_TOKEN_HEADER, INTERNAL_TOKEN);

    expect(response.status).toBe(204);
  });
});
