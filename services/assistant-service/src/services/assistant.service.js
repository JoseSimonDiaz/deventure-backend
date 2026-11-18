import { HINTS_MAX_PER_CHALLENGE } from '@deventure/contracts';
import {
  AppError,
  ConflictError,
  ForbiddenError,
  ServiceUnavailableError,
  ValidationError,
  logger,
} from '@deventure/service-kit';
import { AnswerSource } from '../../generated/prisma-client/index.js';
import { contentClient } from '../clients/content.client.js';
import { gameplayClient } from '../clients/gameplay.client.js';
import { assistantRepository } from '../repositories/assistant.repository.js';
import { generateAiHint, generateOracleAnswer, isAiAvailable } from './aiHint.service.js';

export const ASSISTANT_QUERIES_PER_LEVEL = 10;
export const ORACLE_QUERIES_PER_DAY = 10;
const ORACLE_TIME_ZONE = 'America/Argentina/Buenos_Aires';
const TOO_MANY_REQUESTS_STATUS = 429;
const IN_PROGRESS_STATUS = 'in_progress';
const NO_HINT_ANSWER =
  'Leé el enunciado otra vez, despacio, y fijate qué dato te piden. ¡Vos podés!';

const limitReachedError = () =>
  new AppError('Ya usaste las 10 consultas al asistente en este nivel', {
    status: TOO_MANY_REQUESTS_STATUS,
    code: 'ASSISTANT_LIMIT_REACHED',
  });

const oracleLimitReachedError = () =>
  new AppError('Ya hiciste las 10 consultas de hoy al oráculo: volvé mañana', {
    status: TOO_MANY_REQUESTS_STATUS,
    code: 'ORACLE_LIMIT_REACHED',
  });

const oracleSilentError = () =>
  new ServiceUnavailableError('El oráculo está en silencio: probá de nuevo en un rato', {
    code: 'ORACLE_UNAVAILABLE',
  });

async function findPlayableSession({ userId, sessionId, challengeId, correlationId }) {
  const session = await gameplayClient.get(`/internal/sessions/${sessionId}`, { correlationId });
  if (session.userId !== userId) throw new ForbiddenError('Esta sesión de juego no es tuya');
  if (session.status !== IN_PROGRESS_STATUS) {
    throw new ConflictError('La sesión de juego ya terminó', { code: 'SESSION_CLOSED' });
  }
  if (session.challengeIds[session.currentIndex] !== challengeId) {
    throw new ValidationError('Ese no es el desafío actual de la sesión', {
      code: 'CHALLENGE_MISMATCH',
    });
  }
  return session;
}

async function fetchFallbackHint({ challengeId, usedQueries, correlationId }) {
  const hintOrder = (usedQueries % HINTS_MAX_PER_CHALLENGE) + 1;
  try {
    const hint = await contentClient.get(`/internal/challenges/${challengeId}/hints/${hintOrder}`, {
      correlationId,
    });
    return hint.text;
  } catch (hintError) {
    logger.warn({ err: hintError, challengeId, correlationId }, 'Sin pista para el respaldo');
    return NO_HINT_ANSWER;
  }
}

async function answerQuestion({ challenge, question, usedQueries, correlationId }) {
  if (!isAiAvailable()) {
    const hintText = await fetchFallbackHint({
      challengeId: challenge.id,
      usedQueries,
      correlationId,
    });
    return { answer: hintText, source: AnswerSource.hint };
  }
  try {
    const aiAnswer = await generateAiHint({ challenge, question });
    return { answer: aiAnswer, source: AnswerSource.ai };
  } catch (aiError) {
    logger.error(
      { err: aiError, challengeId: challenge.id, correlationId },
      'El asistente IA no respondió; se usa la pista del desafío',
    );
    const hintText = await fetchFallbackHint({
      challengeId: challenge.id,
      usedQueries,
      correlationId,
    });
    return { answer: hintText, source: AnswerSource.hint };
  }
}

export async function askAssistant({ userId, sessionId, challengeId, question, correlationId }) {
  const session = await findPlayableSession({ userId, sessionId, challengeId, correlationId });
  const usedQueries = await assistantRepository.countLevelQueries(userId, session.levelId);
  if (usedQueries >= ASSISTANT_QUERIES_PER_LEVEL) throw limitReachedError();

  const challenge = await contentClient.get(`/internal/challenges/${challengeId}`, {
    correlationId,
  });
  const { answer, source } = await answerQuestion({
    challenge,
    question,
    usedQueries,
    correlationId,
  });
  const savedQuery = await assistantRepository.saveQuery({
    userId,
    sessionId,
    levelId: session.levelId,
    challengeId,
    question,
    answer,
    source,
    limit: ASSISTANT_QUERIES_PER_LEVEL,
  });
  if (!savedQuery) throw limitReachedError();
  return {
    hint: answer,
    source,
    remaining: ASSISTANT_QUERIES_PER_LEVEL - savedQuery.queryNumber,
  };
}

async function generateOracleAnswerOrThrow({ userId, question, correlationId }) {
  if (!isAiAvailable()) throw oracleSilentError();
  try {
    return await generateOracleAnswer(question);
  } catch (aiError) {
    logger.error({ err: aiError, userId, correlationId }, 'El oráculo IA no respondió');
    throw oracleSilentError();
  }
}

export async function askOracle({ userId, question, correlationId }) {
  const usedQueries = await assistantRepository.countTodayOracleQueries({
    userId,
    timeZone: ORACLE_TIME_ZONE,
  });
  if (usedQueries >= ORACLE_QUERIES_PER_DAY) throw oracleLimitReachedError();

  const answer = await generateOracleAnswerOrThrow({ userId, question, correlationId });
  const savedQuery = await assistantRepository.saveOracleQuery({
    userId,
    question,
    answer,
    timeZone: ORACLE_TIME_ZONE,
    limit: ORACLE_QUERIES_PER_DAY,
  });
  if (!savedQuery) throw oracleLimitReachedError();
  return { answer, remaining: ORACLE_QUERIES_PER_DAY - savedQuery.queryNumber };
}

export function deleteUserData(userId) {
  return assistantRepository.deleteUserData(userId);
}
