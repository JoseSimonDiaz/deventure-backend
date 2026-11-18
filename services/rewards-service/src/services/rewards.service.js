import { NotFoundError } from '@deventure/service-kit';
import { contentClient } from '../clients/content.client.js';
import { progressClient } from '../clients/progress.client.js';
import { rewardsRepository } from '../repositories/rewards.repository.js';

const STRUCTURE_CACHE_TTL_MS = 5 * 60 * 1000;
const structureCache = { zonesStructure: [], expiresAt: 0 };

async function getZonesStructure(correlationId) {
  if (Date.now() < structureCache.expiresAt) return structureCache.zonesStructure;
  structureCache.zonesStructure = await contentClient.get('/internal/zones/structure', {
    correlationId,
  });
  structureCache.expiresAt = Date.now() + STRUCTURE_CACHE_TTL_MS;
  return structureCache.zonesStructure;
}

export async function evaluateRewards({ sessionId, userId }, correlationId) {
  const processedEvaluation = await rewardsRepository.findProcessedEvaluation(sessionId);
  if (processedEvaluation) return processedEvaluation.response;

  const achievements = await progressClient.get(`/internal/users/${userId}/achievements`, {
    correlationId,
  });
  return rewardsRepository.grantEarnedRewards({ sessionId, userId, achievements });
}

export async function getPlayerGallery({ userId, type, status, correlationId }) {
  const zonesStructure = await getZonesStructure(correlationId);
  return rewardsRepository.findPlayerGallery({
    userId,
    type: type ?? null,
    status: status ?? null,
    zonesStructure,
  });
}

export async function markRewardSeen(userId, rewardId) {
  const updatedCount = await rewardsRepository.markSeen(userId, rewardId);
  if (updatedCount === 0) {
    throw new NotFoundError('Todavía no tenés esa recompensa', { code: 'REWARD_NOT_OWNED' });
  }
}

export async function getOwnedReward(userId, rewardId) {
  const ownedReward = await rewardsRepository.findOwnedReward(userId, rewardId);
  if (!ownedReward) return { owned: false, type: null, imageUrl: null };
  return { owned: true, ...ownedReward.reward };
}

export function deletePlayerData(userId) {
  return rewardsRepository.deletePlayerData(userId);
}
