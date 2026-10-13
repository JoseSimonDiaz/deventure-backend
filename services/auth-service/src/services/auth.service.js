import { ConflictError, LockedError, UnauthorizedError } from '@deventure/service-kit';
import { signToken } from '../lib/jwt.js';
import { DUMMY_HASH, hashPassword, verifyPassword } from '../lib/password.js';
import { userRepository } from '../repositories/user.repository.js';

const MS_PER_MINUTE = 60 * 1000;
const PRISMA_UNIQUE_CONSTRAINT_CODE = 'P2002';

export const MAX_FAILED_LOGINS = 5;
export const FAILED_LOGIN_WINDOW_MS = 15 * MS_PER_MINUTE;
export const LOCK_DURATION_MS = 15 * MS_PER_MINUTE;

const RESET_LOGIN_ATTEMPTS = Object.freeze({
  failedLoginCount: 0,
  failedLoginWindowStart: null,
  lockedUntil: null,
});

const usernameTakenError = () =>
  new ConflictError('Ese nombre de usuario ya está en uso', { code: 'USERNAME_TAKEN' });
const emailTakenError = () =>
  new ConflictError('Ese email ya está registrado', { code: 'EMAIL_TAKEN' });
const invalidCredentialsError = () =>
  new UnauthorizedError('Usuario o contraseña incorrectos', { code: 'INVALID_CREDENTIALS' });

export async function register({ username, email, password }) {
  const usernameLower = username.toLowerCase();

  const existingUser = await userRepository.findByUsernameOrEmail({ usernameLower, email });
  if (existingUser?.usernameLower === usernameLower) throw usernameTakenError();
  if (existingUser) throw emailTakenError();

  const passwordHash = await hashPassword(password);
  const createdUser = await createUserOrThrowConflict({
    username,
    usernameLower,
    email,
    passwordHash,
  });

  return { token: signToken(createdUser), user: createdUser };
}

async function createUserOrThrowConflict(userData) {
  try {
    return await userRepository.createPublic(userData);
  } catch (creationError) {
    if (creationError.code !== PRISMA_UNIQUE_CONSTRAINT_CODE) throw creationError;
    throw String(creationError.meta?.target).includes('email')
      ? emailTakenError()
      : usernameTakenError();
  }
}

export async function login({ identifier, password }, now = new Date()) {
  const user = await userRepository.findForLogin(identifier);
  if (!user) {
    await verifyPassword(password, DUMMY_HASH);
    throw invalidCredentialsError();
  }

  assertAccountNotLocked(user, now);

  const isPasswordValid = await verifyPassword(password, user.passwordHash);
  if (!isPasswordValid) {
    await registerFailedLogin(user, now);
    throw invalidCredentialsError();
  }

  const loggedInUser = await userRepository.updatePublic(user.id, {
    ...RESET_LOGIN_ATTEMPTS,
    lastLoginAt: now,
  });
  return { token: signToken(loggedInUser), user: loggedInUser };
}

function assertAccountNotLocked(user, now) {
  const isLocked = Boolean(user.lockedUntil) && user.lockedUntil > now;
  if (!isLocked) return;

  const minutesUntilUnlock = Math.ceil(
    (user.lockedUntil.getTime() - now.getTime()) / MS_PER_MINUTE,
  );
  throw new LockedError(
    `Cuenta bloqueada por demasiados intentos fallidos. Probá de nuevo en ${minutesUntilUnlock} min.`,
    { code: 'ACCOUNT_LOCKED', details: { lockedUntil: user.lockedUntil.toISOString() } },
  );
}

async function registerFailedLogin(user, now) {
  const windowStart = user.failedLoginWindowStart;
  const isWindowExpired =
    !windowStart || now.getTime() - windowStart.getTime() > FAILED_LOGIN_WINDOW_MS;
  const failedLoginCount = isWindowExpired ? 1 : user.failedLoginCount + 1;

  if (failedLoginCount >= MAX_FAILED_LOGINS) {
    await userRepository.updateLoginAttempts(user.id, {
      ...RESET_LOGIN_ATTEMPTS,
      lockedUntil: new Date(now.getTime() + LOCK_DURATION_MS),
    });
    return;
  }

  await userRepository.updateLoginAttempts(user.id, {
    failedLoginCount,
    failedLoginWindowStart: isWindowExpired ? now : windowStart,
  });
}

export async function getMe(userId) {
  const user = await userRepository.findPublicById(userId);
  if (!user) throw new UnauthorizedError('La cuenta ya no existe');
  return user;
}
