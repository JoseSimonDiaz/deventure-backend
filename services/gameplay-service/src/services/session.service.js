import {
  AppError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  logger,
} from '@deventure/service-kit';
import { SessionStatus } from '../../generated/prisma-client/index.js';
import { contentClient } from '../clients/content.client.js';
import { progressClient } from '../clients/progress.client.js';
import { sessionRepository } from '../repositories/session.repository.js';

const MS_PER_HOUR = 60 * 60 * 1000;
export const SESSION_MAX_DURATION_MS = 2 * MS_PER_HOUR;
const TOO_MANY_REQUESTS_STATUS = 429;

export function rejectSessionRequest(error, { userId, sessionId, rule, correlationId }) {
  logger.warn({ userId, sessionId, rule, correlationId }, error.message);
  return error;
}

export function assertMinimumDelay({ since, now, minimumMs, rejection }) {
  const hasWaitedEnough = !since || now.getTime() - since.getTime() >= minimumMs;
  if (hasWaitedEnough) return;
  throw rejectSessionRequest(
    new AppError('Más despacio: tomate un momento antes de responder', {
      status: TOO_MANY_REQUESTS_STATUS,
      code: 'TOO_FAST',
    }),
    rejection,
  );
}

async function findOwnedSession({ userId, sessionId, correlationId }) {
  const session = await sessionRepository.findById(sessionId);
  if (!session) {
    throw new NotFoundError('La sesión de juego no existe', { code: 'SESSION_NOT_FOUND' });
  }
  if (session.userId !== userId) {
    throw rejectSessionRequest(new ForbiddenError('Esta sesión de juego no es tuya'), {
      userId,
      sessionId,
      rule: 'session-owner',
      correlationId,
    });
  }
  return session;
}

export async function getPlayableSession({ userId, sessionId, challengeId, correlationId }) {
  const session = await findOwnedSession({ userId, sessionId, correlationId });
  const rejection = { userId, sessionId, correlationId };
  if (session.status !== SessionStatus.in_progress) {
    throw rejectSessionRequest(
      new ConflictError('La sesión de juego ya terminó', { code: 'SESSION_CLOSED' }),
      { ...rejection, rule: 'session-closed' },
    );
  }
  if (session.challengeIds[session.currentIndex] !== challengeId) {
    throw rejectSessionRequest(
      new ValidationError('Ese no es el desafío actual de la sesión', {
        code: 'CHALLENGE_MISMATCH',
      }),
      { ...rejection, rule: 'challenge-mismatch' },
    );
  }
  return session;
}

async function openNewSession({ userId, levelId, correlationId }) {
  const [levelSummary, levelUnlock] = await Promise.all([
    contentClient.get(`/internal/levels/${levelId}/summary`, { correlationId }),
    progressClient.get(`/internal/users/${userId}/unlocked/${levelId}`, { correlationId }),
  ]);
  if (!levelUnlock.unlocked) {
    throw rejectSessionRequest(
      new ForbiddenError('Completá el nivel anterior para desbloquear este', {
        code: 'LEVEL_LOCKED',
      }),
      { userId, sessionId: null, rule: 'level-locked', correlationId },
    );
  }
  if (levelSummary.challengeIds.length === 0) {
    throw new ConflictError('Este nivel todavía no tiene desafíos', {
      code: 'LEVEL_WITHOUT_CHALLENGES',
    });
  }
  return sessionRepository.create({
    userId,
    levelId,
    zoneId: levelSummary.zoneId,
    challengeIds: levelSummary.challengeIds,
    initialLives: levelSummary.initialLives,
    livesLeft: levelSummary.initialLives,
    nextLevelId: levelSummary.nextLevel?.levelId,
    isLastOfZone: levelSummary.isLastOfZone,
  });
}

export async function startSession({ userId, levelId, correlationId }) {
  const resumableSession = await sessionRepository.findLatestInProgress({
    userId,
    levelId,
    startedAfter: new Date(Date.now() - SESSION_MAX_DURATION_MS),
  });
  if (resumableSession) return resumableSession;
  return openNewSession({ userId, levelId, correlationId });
}

export function getSession({ userId, sessionId, correlationId }) {
  return findOwnedSession({ userId, sessionId, correlationId });
}

export async function abandonSession({ userId, sessionId, correlationId }) {
  await findOwnedSession({ userId, sessionId, correlationId });
  const abandonedCount = await sessionRepository.abandonInProgress(sessionId);
  if (abandonedCount === 0) {
    throw new ConflictError('La sesión de juego ya terminó', { code: 'SESSION_CLOSED' });
  }
  return sessionRepository.findById(sessionId);
}

export async function getSessionForInternalUse(sessionId) {
  const session = await sessionRepository.findById(sessionId);
  if (!session) {
    throw new NotFoundError('La sesión de juego no existe', { code: 'SESSION_NOT_FOUND' });
  }
  return session;
}

export function expireOldSessions(now = new Date()) {
  return sessionRepository.abandonStartedBefore(new Date(now.getTime() - SESSION_MAX_DURATION_MS));
}

export function deleteUserData(userId) {
  return sessionRepository.deleteUserData(userId);
}
