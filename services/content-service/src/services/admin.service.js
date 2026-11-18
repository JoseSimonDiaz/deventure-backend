import { NotFoundError, ValidationError } from '@deventure/service-kit';
import { gameplayClient } from '../clients/gameplay.client.js';
import { adminRepository } from '../repositories/admin.repository.js';

const zoneNotFoundError = () => new NotFoundError('La zona no existe', { code: 'ZONE_NOT_FOUND' });
const levelNotFoundError = () =>
  new NotFoundError('El nivel no existe', { code: 'LEVEL_NOT_FOUND' });
const challengeNotFoundError = () =>
  new NotFoundError('El desafío no existe', { code: 'CHALLENGE_NOT_FOUND' });

function failIfMissing(entity, buildError) {
  if (!entity) throw buildError();
  return entity;
}

export function listZones() {
  return adminRepository.findAllZones();
}

export function createZone(userId, zoneData) {
  return adminRepository.createZone(userId, zoneData);
}

export async function updateZone(userId, zoneId, zonePatch) {
  const { isArchived, ...zoneData } = zonePatch;
  const archiveData = Object.hasOwn(zonePatch, 'isArchived')
    ? { archivedAt: isArchived ? new Date() : null }
    : {};
  const zone = await adminRepository.updateZone(userId, zoneId, { ...zoneData, ...archiveData });
  return failIfMissing(zone, zoneNotFoundError);
}

export function createLevel(userId, zoneId, levelData) {
  return adminRepository.createLevel(userId, zoneId, levelData);
}

export async function updateLevel(userId, levelId, levelData) {
  const level = await adminRepository.updateLevel(userId, levelId, levelData);
  return failIfMissing(level, levelNotFoundError);
}

export async function reorderLevels(userId, zoneId, levelIds) {
  const zone = await adminRepository.reorderLevels(userId, zoneId, levelIds);
  if (!zone) {
    throw new ValidationError('La lista tiene que incluir exactamente los niveles de la zona', {
      code: 'INVALID_LEVEL_ORDER',
    });
  }
  return zone;
}

export async function listLevelChallenges(levelId) {
  const level = await adminRepository.findLevelChallenges(levelId);
  return failIfMissing(level, levelNotFoundError);
}

export function createChallenge(userId, levelId, challengeData) {
  return adminRepository.createChallenge(userId, levelId, challengeData);
}

export async function replaceChallenge(userId, challengeId, challengeData) {
  const challenge = await adminRepository.replaceChallenge(userId, challengeId, challengeData);
  return failIfMissing(challenge, challengeNotFoundError);
}

export async function deleteChallenge(userId, challengeId) {
  const challenge = await adminRepository.deleteChallenge(userId, challengeId);
  failIfMissing(challenge, challengeNotFoundError);
}

export function previewChallenge({ challenge, answer }, correlationId) {
  return gameplayClient.post('/internal/validations', { challenge, answer }, { correlationId });
}
