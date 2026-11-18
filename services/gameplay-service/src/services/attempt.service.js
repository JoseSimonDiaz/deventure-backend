import { ConflictError, ValidationError } from '@deventure/service-kit';
import { SessionStatus } from '../../generated/prisma-client/index.js';
import { contentClient } from '../clients/content.client.js';
import { sessionRepository } from '../repositories/session.repository.js';
import { VALIDATORS } from '../validators/index.js';
import { completeLevel } from './levelCompletion.service.js';
import { assertMinimumDelay, getPlayableSession } from './session.service.js';

const MIN_MS_BETWEEN_ATTEMPTS = 1000;
const MIN_MS_TO_FIRST_CORRECT = 2000;
const NO_DETAILS = Object.freeze({});

export async function validateAnswer(challenge, answer) {
  if (challenge.type !== answer.type) {
    throw new ValidationError('La respuesta no corresponde al tipo de desafío', {
      code: 'ANSWER_TYPE_MISMATCH',
    });
  }
  return VALIDATORS.get(challenge.type)(challenge, answer);
}

function buildAttemptResult({ validation, challenge, appliedAttempt }) {
  return {
    correct: validation.isCorrect,
    explanation: validation.isCorrect ? challenge.explanation : null,
    message: validation.message ?? null,
    details: validation.details ?? NO_DETAILS,
    livesLeft: appliedAttempt.livesLeft,
    nextIndex: appliedAttempt.currentIndex,
    total: appliedAttempt.total,
    sessionStatus: appliedAttempt.status,
  };
}

export async function submitAttempt({ userId, sessionId, challengeId, answer, correlationId }) {
  const now = new Date();
  const session = await getPlayableSession({ userId, sessionId, challengeId, correlationId });
  const rejection = { userId, sessionId, correlationId, rule: 'too-fast' };
  assertMinimumDelay({
    since: session.lastAttemptAt,
    now,
    minimumMs: MIN_MS_BETWEEN_ATTEMPTS,
    rejection,
  });

  const challenge = await contentClient.get(`/internal/challenges/${challengeId}`, {
    correlationId,
  });
  const validation = await validateAnswer(challenge, answer);
  if (validation.isCorrect && session.currentIndex === 0) {
    assertMinimumDelay({
      since: session.startedAt,
      now,
      minimumMs: MIN_MS_TO_FIRST_CORRECT,
      rejection,
    });
  }

  const appliedAttempt = await sessionRepository.applyAttempt({
    session,
    challengeId,
    answer,
    isCorrect: validation.isCorrect,
    now,
  });
  if (!appliedAttempt) {
    throw new ConflictError('Ya se registró una respuesta para este desafío', {
      code: 'CONCURRENT_ATTEMPT',
    });
  }

  const attemptResult = buildAttemptResult({ validation, challenge, appliedAttempt });
  if (appliedAttempt.status !== SessionStatus.won) return attemptResult;

  const levelResult = await completeLevel(appliedAttempt, correlationId);
  return { ...attemptResult, ...levelResult };
}
