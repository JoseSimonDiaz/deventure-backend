import bcrypt from 'bcryptjs';
import { config } from '../config.js';

/** @param {string} password */
export const hashPassword = (password) => bcrypt.hash(password, config.BCRYPT_ROUNDS);

/**
 * @param {string} password
 * @param {string} hash
 */
export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);

// Hash de una contraseña aleatoria: se compara contra él cuando el usuario no existe, para que el
// login tarde lo mismo exista o no la cuenta (no revela qué usuarios están registrados).
export const DUMMY_HASH = bcrypt.hashSync(crypto.randomUUID(), config.BCRYPT_ROUNDS);
