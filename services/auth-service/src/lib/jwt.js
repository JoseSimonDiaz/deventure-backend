import jwt from 'jsonwebtoken';
import { config } from '../config.js';

/**
 * Firma el JWT de sesión: `{ sub, role, username }`, HS256, vence en JWT_EXPIRES_IN (24h).
 * @param {{ id: string, role: string, username: string }} user
 */
export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, username: user.username }, config.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: config.JWT_EXPIRES_IN,
  });
}
