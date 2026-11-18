import { logger } from '@deventure/service-kit';
import { HttpMethod, InternalTarget } from '../../generated/prisma-client/index.js';
import { progressClient } from '../clients/progress.client.js';
import { rewardsClient } from '../clients/rewards.client.js';
import { pendingCallRepository } from '../repositories/pendingCall.repository.js';

const LEVEL_COMPLETIONS_PATH = '/internal/level-completions';
const EVALUATIONS_PATH = '/internal/evaluations';
const PROGRESS_NOT_SAVED = Object.freeze({
  isNewBest: false,
  unlockedLevelIds: [],
  unlockedZoneId: null,
});
const NO_REWARDS = Object.freeze({ unlocked: [] });

async function sendOrEnqueue({ target, client, path, body, session, correlationId, fallback }) {
  try {
    const response = await client.post(path, body, { correlationId });
    return { isDelivered: true, response };
  } catch (deliveryError) {
    logger.error(
      {
        err: deliveryError,
        target,
        sessionId: session.sessionId,
        userId: session.userId,
        correlationId,
      },
      'No se pudo avisar el nivel ganado; queda encolado para reintentar',
    );
    await pendingCallRepository.enqueue({
      target,
      method: HttpMethod.POST,
      path,
      body,
      sessionId: session.sessionId,
      userId: session.userId,
      correlationId,
      lastError: deliveryError.message,
    });
    return { isDelivered: false, response: fallback };
  }
}

export async function completeLevel(wonSession, correlationId) {
  const completion = {
    sessionId: wonSession.sessionId,
    userId: wonSession.userId,
    levelId: wonSession.levelId,
    zoneId: wonSession.zoneId,
    stars: wonSession.stars,
    livesLeft: wonSession.livesLeft,
    hintsUsed: wonSession.hintsUsed,
    durationMs: wonSession.durationMs,
    completedAt: wonSession.finishedAt.toISOString(),
  };
  const progressDelivery = await sendOrEnqueue({
    target: InternalTarget.progress,
    client: progressClient,
    path: LEVEL_COMPLETIONS_PATH,
    body: completion,
    session: wonSession,
    correlationId,
    fallback: PROGRESS_NOT_SAVED,
  });
  const rewardsDelivery = await sendOrEnqueue({
    target: InternalTarget.rewards,
    client: rewardsClient,
    path: EVALUATIONS_PATH,
    body: { sessionId: wonSession.sessionId, userId: wonSession.userId },
    session: wonSession,
    correlationId,
    fallback: NO_REWARDS,
  });

  return {
    result: {
      stars: wonSession.stars,
      correctFirstTry: wonSession.correctFirstTry,
      total: wonSession.total,
      durationMs: wonSession.durationMs,
      hintsUsed: wonSession.hintsUsed,
      isNewBest: progressDelivery.response.isNewBest,
    },
    unlockedLevelIds: progressDelivery.response.unlockedLevelIds,
    unlockedZoneId: progressDelivery.response.unlockedZoneId,
    nextLevelId: wonSession.nextLevelId,
    isLastOfZone: wonSession.isLastOfZone,
    isLastOfGame: !wonSession.nextLevelId,
    rewardsUnlocked: rewardsDelivery.response.unlocked,
    progressSaved: progressDelivery.isDelivered,
  };
}
