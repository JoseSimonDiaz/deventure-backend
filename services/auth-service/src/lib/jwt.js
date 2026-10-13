import jwt from 'jsonwebtoken';
import { config } from '../config.js';

export function signToken(user) {
  return jwt.sign({ sub: user.id, role: user.role, username: user.username }, config.JWT_SECRET, {
    algorithm: 'HS256',
    expiresIn: config.JWT_EXPIRES_IN,
  });
}
