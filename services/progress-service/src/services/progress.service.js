import { NotFoundError } from '@deventure/service-kit';
import { contentClient } from '../clients/content.client.js';
import { progressRepository } from '../repositories/progress.repository.js';

const NO_NEXT_LEVEL = Object.freeze({ levelId: null, zoneId: null });
const DEFAULT_STATS_RANGE_MS = 30 * 24 * 60 * 60 * 1000;

const fetchZonesStructure = (correlationId) =>
  contentClient.get('/internal/zones/structure', { correlationId });

async function ensurePlayerStarted(userId, correlationId) {
  const player = await progressRepository.findPlayer(userId);
  if (player) return;

  const [firstZone] = await fetchZonesStructure(correlationId);
  if (!firstZone) {
    throw new NotFoundError('Todavía no hay zonas publicadas', { code: 'NO_PUBLISHED_ZONES' });
  }
  const [firstLevel] = firstZone.levels;
  await progressRepository.createPlayerWithFirstLevel(userId, firstLevel.levelId);
}

export async function getMyProgress(userId, correlationId) {
  await ensurePlayerStarted(userId, correlationId);
  return progressRepository.findPlayerProgress(userId);
}

export async function getMySummary(userId, correlationId) {
  await ensurePlayerStarted(userId, correlationId);
  const zonesStructure = await fetchZonesStructure(correlationId);
  return progressRepository.findPlayerSummary(userId, zonesStructure);
}

export async function isLevelUnlocked(userId, levelId, correlationId) {
  await ensurePlayerStarted(userId, correlationId);
  const isUnlocked = await progressRepository.isLevelUnlocked(userId, levelId);
  return { unlocked: isUnlocked };
}

export async function registerLevelCompletion(completion, correlationId) {
  const processedCompletion = await progressRepository.findProcessedCompletion(
    completion.sessionId,
  );
  if (processedCompletion) return processedCompletion.response;

  const levelSummary = await contentClient.get(`/internal/levels/${completion.levelId}/summary`, {
    correlationId,
  });
  return progressRepository.saveLevelCompletion({
    completion,
    nextLevel: levelSummary.nextLevel ?? NO_NEXT_LEVEL,
    zoneLevelIds: levelSummary.zoneLevelIds,
  });
}

export async function getPlayerAchievements(userId, correlationId) {
  const zonesStructure = await fetchZonesStructure(correlationId);
  return progressRepository.findPlayerAchievements(userId, zonesStructure);
}

export function getSeenTheory(userId) {
  return progressRepository.findSeenTheoryZoneIds(userId);
}

export function markTheorySeen(userId, zoneId) {
  return progressRepository.markTheorySeen(userId, zoneId);
}

export function deletePlayerData(userId) {
  return progressRepository.deletePlayerData(userId);
}

export function getCompletionStats({ from, to }) {
  const rangeEnd = to ?? new Date();
  const rangeStart = from ?? new Date(rangeEnd.getTime() - DEFAULT_STATS_RANGE_MS);
  return progressRepository.findCompletionStats({ from: rangeStart, to: rangeEnd });
}
