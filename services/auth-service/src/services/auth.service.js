import { ConflictError, LockedError, UnauthorizedError } from '@deventure/service-kit';
import { signToken } from '../lib/jwt.js';
import { DUMMY_HASH, hashPassword, verifyPassword } from '../lib/password.js';
import { toPublicUser } from '../mappers/user.mapper.js';
import { userRepository } from '../repositories/user.repository.js';

export const MAX_FAILED_LOGINS = 5;
export const FAILED_LOGIN_WINDOW_MS = 15 * 60 * 1000;
export const LOCK_DURATION_MS = 15 * 60 * 1000;

const usernameTaken = () =>
  new ConflictError('Ese nombre de usuario ya está en uso', { code: 'USERNAME_TAKEN' });
const emailTaken = () => new ConflictError('Ese email ya está registrado', { code: 'EMAIL_TAKEN' });
const invalidCredentials = () =>
  new UnauthorizedError('Usuario o contraseña incorrectos', { code: 'INVALID_CREDENTIALS' });

/**
 * Registra un jugador nuevo y lo deja logueado.
 * @param {import('@deventure/contracts').RegisterRequest} input
 * @returns {Promise<import('@deventure/contracts').AuthResponse>}
 */
export async function register({ username, email, password }) {
  const usernameLower = username.toLowerCase();

  const taken = await userRepository.findTaken({ usernameLower, email });
  if (taken?.usernameLower === usernameLower) throw usernameTaken();
  if (taken) throw emailTaken();

  const passwordHash = await hashPassword(password);
  let user;
  try {
    user = await userRepository.create({ username, usernameLower, email, passwordHash });
  } catch (err) {
    // Dos registros simultáneos con el mismo dato: la base frena al segundo (índice único)
    if (err?.code === 'P2002') {
      throw String(err.meta?.target).includes('email') ? emailTaken() : usernameTaken();
    }
    throw err;
  }

  return { token: signToken(user), user: toPublicUser(user) };
}

/**
 * Inicia sesión con username o email. Después de 5 contraseñas incorrectas dentro de 15 minutos
 * la cuenta queda bloqueada 15 minutos (423 ACCOUNT_LOCKED, aunque la contraseña sea correcta).
 * @param {import('@deventure/contracts').LoginRequest} input
 * @param {Date} [now]
 * @returns {Promise<import('@deventure/contracts').AuthResponse>}
 */
export async function login({ identifier, password }, now = new Date()) {
  const user = await userRepository.findForLogin(identifier);
  if (!user) {
    await verifyPassword(password, DUMMY_HASH);
    throw invalidCredentials();
  }

  if (user.lockedUntil && user.lockedUntil > now) {
    const minutes = Math.ceil((user.lockedUntil.getTime() - now.getTime()) / 60000);
    throw new LockedError(
      `Cuenta bloqueada por demasiados intentos fallidos. Probá de nuevo en ${minutes} min.`,
      { code: 'ACCOUNT_LOCKED', details: { lockedUntil: user.lockedUntil.toISOString() } },
    );
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    await registerFailedLogin(user, now);
    throw invalidCredentials();
  }

  const updated = await userRepository.update(user.id, {
    failedLoginCount: 0,
    failedLoginWindowStart: null,
    lockedUntil: null,
    lastLoginAt: now,
  });
  return { token: signToken(updated), user: toPublicUser(updated) };
}

/** Suma un intento fallido; al llegar a 5 dentro de la ventana bloquea la cuenta. */
async function registerFailedLogin(user, now) {
  const windowStart = user.failedLoginWindowStart;
  const windowExpired =
    !windowStart || now.getTime() - windowStart.getTime() > FAILED_LOGIN_WINDOW_MS;
  const count = windowExpired ? 1 : user.failedLoginCount + 1;

  if (count >= MAX_FAILED_LOGINS) {
    await userRepository.update(user.id, {
      failedLoginCount: 0,
      failedLoginWindowStart: null,
      lockedUntil: new Date(now.getTime() + LOCK_DURATION_MS),
    });
    return;
  }

  await userRepository.update(user.id, {
    failedLoginCount: count,
    failedLoginWindowStart: windowExpired ? now : windowStart,
  });
}

/**
 * Datos del usuario logueado.
 * @param {string} userId
 */
export async function getMe(userId) {
  const user = await userRepository.findById(userId);
  if (!user) throw new UnauthorizedError('La cuenta ya no existe');
  return toPublicUser(user);
}
