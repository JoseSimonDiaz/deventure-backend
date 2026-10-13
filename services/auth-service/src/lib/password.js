import bcrypt from 'bcryptjs';
import { config } from '../config.js';

export const hashPassword = (password) => bcrypt.hash(password, config.BCRYPT_ROUNDS);

export const verifyPassword = (password, hash) => bcrypt.compare(password, hash);

export const DUMMY_HASH = bcrypt.hashSync(crypto.randomUUID(), config.BCRYPT_ROUNDS);
