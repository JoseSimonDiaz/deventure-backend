import { NotFoundError } from '@deventure/service-kit';
import { contentRepository } from '../repositories/content.repository.js';

const levelNotFoundError = () =>
  new NotFoundError('El nivel no existe o no está publicado', { code: 'LEVEL_NOT_FOUND' });
const zoneNotFoundError = () =>
  new NotFoundError('La zona no existe o no está publicada', { code: 'ZONE_NOT_FOUND' });
const challengeNotFoundError = () =>
  new NotFoundError('El desafío no existe', { code: 'CHALLENGE_NOT_FOUND' });

export function listPublishedZones() {
  return contentRepository.findPublishedZonesWithLevels();
}

export async function getLevelForPlayer(levelId) {
  const level = await contentRepository.findPublishedLevelForPlayer(levelId);
  if (!level) throw levelNotFoundError();
  return level;
}

export async function getZoneTheory(zoneId) {
  const zoneTheory = await contentRepository.findPublishedZoneTheory(zoneId);
  if (!zoneTheory) throw zoneNotFoundError();
  return zoneTheory;
}

export async function getLevelSummary(levelId) {
  const levelSummary = await contentRepository.findPublishedLevelSummary(levelId);
  if (!levelSummary) throw levelNotFoundError();
  return levelSummary;
}

export async function getChallengeWithSolution(challengeId) {
  const challenge = await contentRepository.findChallengeWithSolution(challengeId);
  if (!challenge) throw challengeNotFoundError();
  return challenge;
}
