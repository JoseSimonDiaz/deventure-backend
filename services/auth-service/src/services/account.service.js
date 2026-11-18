import { DEFAULT_SETTINGS } from '@deventure/contracts';
import {
  ConflictError,
  ForbiddenError,
  NotFoundError,
  ValidationError,
  logger,
} from '@deventure/service-kit';
import { HttpMethod, InternalTarget } from '../../generated/prisma-client/index.js';
import { gameplayClient } from '../clients/gameplay.client.js';
import { progressClient } from '../clients/progress.client.js';
import { assistantClient } from '../clients/assistant.client.js';
import { rewardsClient } from '../clients/rewards.client.js';
import { signToken } from '../lib/jwt.js';
import { hashPassword, verifyPassword } from '../lib/password.js';
import { pendingCallRepository } from '../repositories/pendingCall.repository.js';
import { userRepository } from '../repositories/user.repository.js';
import {
  accountNotFoundError,
  assertAccountNotLocked,
  registerFailedLogin,
} from './auth.service.js';

const PRISMA_UNIQUE_CONSTRAINT_CODE = 'P2002';
const AVATAR_REWARD_TYPE = 'avatar';
const ACTIVE_USERS_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;
const DEFAULT_STATS_RANGE_MS = 30 * 24 * 60 * 60 * 1000;

const wrongPasswordError = () =>
  new ForbiddenError('La contraseña no es correcta', { code: 'INVALID_PASSWORD' });

async function findUserWithValidPassword(userId, password, now = new Date()) {
  const user = await userRepository.findWithPasswordById(userId);
  if (!user) throw accountNotFoundError();
  assertAccountNotLocked(user, now);
  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (isPasswordValid) return user;
  await registerFailedLogin(user, now);
  throw wrongPasswordError();
}

export async function getSettings(userId) {
  const { settings } = await userRepository.findSettings(userId);
  return { ...DEFAULT_SETTINGS, ...settings };
}

export async function updateSettings(userId, settingsPatch) {
  const { settings } = await userRepository.mergeSettings(userId, settingsPatch);
  return { ...DEFAULT_SETTINGS, ...settings };
}

export async function updateUsername(userId, username) {
  try {
    const updatedUser = await userRepository.updatePublic(userId, {
      username,
      usernameLower: username.toLowerCase(),
    });
    return { token: signToken(updatedUser), user: updatedUser };
  } catch (updateError) {
    if (updateError.code !== PRISMA_UNIQUE_CONSTRAINT_CODE) throw updateError;
    throw new ConflictError('Ese nombre de usuario ya está en uso', { code: 'USERNAME_TAKEN' });
  }
}

export async function changePassword(userId, { currentPassword, newPassword }) {
  await findUserWithValidPassword(userId, currentPassword);
  const passwordHash = await hashPassword(newPassword);
  const updatedUser = await userRepository.updatePasswordAndRevokeSessions(userId, passwordHash);
  return { token: signToken(updatedUser), user: updatedUser };
}

export async function getSessionVersion(userId) {
  const userSession = await userRepository.findSessionVersion(userId);
  if (!userSession)
    throw new NotFoundError('La cuenta ya no existe', { code: 'ACCOUNT_NOT_FOUND' });
  return userSession;
}

async function assertOwnsAvatarReward(userId, rewardId, correlationId) {
  const ownedReward = await rewardsClient.get(`/internal/users/${userId}/rewards/${rewardId}`, {
    correlationId,
  });
  if (!ownedReward.owned || ownedReward.type !== AVATAR_REWARD_TYPE) {
    throw new ForbiddenError('Ese avatar todavía no lo desbloqueaste', {
      code: 'AVATAR_NOT_OWNED',
    });
  }
}

export async function updateAvatar(userId, avatarChoice, correlationId) {
  if (Object.hasOwn(avatarChoice, 'avatarRewardId')) {
    await assertOwnsAvatarReward(userId, avatarChoice.avatarRewardId, correlationId);
    return userRepository.updatePublic(userId, {
      avatarRewardId: avatarChoice.avatarRewardId,
      avatarBase: null,
    });
  }
  return userRepository.updatePublic(userId, {
    avatarBase: avatarChoice.avatarBase,
    avatarRewardId: null,
  });
}

async function deleteDataInService({ target, client, userId, correlationId }) {
  const path = `/internal/users/${userId}`;
  try {
    await client.delete(path, { correlationId });
  } catch (deleteError) {
    logger.error(
      { err: deleteError, target, userId, correlationId },
      'No se pudieron borrar los datos del jugador; queda encolado para reintentar',
    );
    await pendingCallRepository.enqueue({
      target,
      method: HttpMethod.DELETE,
      path,
      userId,
      correlationId,
      lastError: deleteError.message,
    });
  }
}

export async function deleteAccount(userId, { password, usernameConfirmation }, correlationId) {
  const user = await findUserWithValidPassword(userId, password);
  if (usernameConfirmation !== user.username) {
    throw new ValidationError('El nombre de usuario no coincide', {
      code: 'USERNAME_CONFIRMATION_MISMATCH',
    });
  }
  await userRepository.deleteById(userId);
  const deletion = { userId, correlationId };
  await deleteDataInService({
    ...deletion,
    target: InternalTarget.gameplay,
    client: gameplayClient,
  });
  await deleteDataInService({
    ...deletion,
    target: InternalTarget.progress,
    client: progressClient,
  });
  await deleteDataInService({ ...deletion, target: InternalTarget.rewards, client: rewardsClient });
  await deleteDataInService({
    ...deletion,
    target: InternalTarget.assistant,
    client: assistantClient,
  });
}

export function getUserStats({ from, to }, now = new Date()) {
  const rangeEnd = to ?? now;
  const rangeStart = from ?? new Date(rangeEnd.getTime() - DEFAULT_STATS_RANGE_MS);
  return userRepository.countUsers({
    from: rangeStart,
    to: rangeEnd,
    activeSince: new Date(now.getTime() - ACTIVE_USERS_WINDOW_MS),
  });
}
