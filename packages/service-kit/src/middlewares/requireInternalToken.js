import { timingSafeEqual } from 'node:crypto';
import { ForbiddenError } from '../errors.js';

export const INTERNAL_TOKEN_HEADER = 'x-internal-token';

function safeEqual(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

/**
 * Protege las rutas /internal/*: el header `x-internal-token` tiene que ser igual a
 * `process.env.INTERNAL_TOKEN`. Si falta, no coincide o el servicio no tiene token configurado → 403.
 */
export function requireInternalToken(req, _res, next) {
  const expected = process.env.INTERNAL_TOKEN;
  const received = req.get(INTERNAL_TOKEN_HEADER);
  if (!expected || !received || !safeEqual(received, expected)) {
    return next(new ForbiddenError('Token interno inválido', { code: 'FORBIDDEN_INTERNAL' }));
  }
  next();
}
