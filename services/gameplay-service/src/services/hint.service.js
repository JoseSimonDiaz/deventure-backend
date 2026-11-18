import { HINTS_MAX_PER_CHALLENGE } from '@deventure/contracts';
import { NotFoundError } from '@deventure/service-kit';
import { contentClient } from '../clients/content.client.js';
import { sessionRepository } from '../repositories/session.repository.js';
import { getPlayableSession } from './session.service.js';

const noMoreHintsError = () =>
  new NotFoundError('No hay más pistas para este desafío', { code: 'NO_MORE_HINTS' });

export async function requestHint({ userId, sessionId, challengeId, correlationId }) {
  await getPlayableSession({ userId, sessionId, challengeId, correlationId });
  const hintsSeen = await sessionRepository.countHintRequests(sessionId, challengeId);
  if (hintsSeen >= HINTS_MAX_PER_CHALLENGE) throw noMoreHintsError();

  const hint = await contentClient.get(
    `/internal/challenges/${challengeId}/hints/${hintsSeen + 1}`,
    {
      correlationId,
    },
  );
  const { hintsUsed } = await sessionRepository.saveHintRequest({
    sessionId,
    challengeId,
    order: hint.order,
  });
  return { order: hint.order, text: hint.text, remaining: hint.total - hint.order, hintsUsed };
}
