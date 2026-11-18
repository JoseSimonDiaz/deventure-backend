import { timingSafeEqual } from 'node:crypto';
import { ForbiddenError } from '../errors.js';

export const INTERNAL_TOKEN_HEADER = 'x-internal-token';

function safeEqual(receivedToken, expectedToken) {
  const receivedBuffer = Buffer.from(receivedToken);
  const expectedBuffer = Buffer.from(expectedToken);
  return (
    receivedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(receivedBuffer, expectedBuffer)
  );
}

export function hasValidInternalToken(req) {
  const expected = process.env.INTERNAL_TOKEN;
  const received = req.get(INTERNAL_TOKEN_HEADER);
  return Boolean(expected && received && safeEqual(received, expected));
}

export function requireInternalToken(req, _res, next) {
  if (!hasValidInternalToken(req)) {
    return next(new ForbiddenError('Token interno inválido', { code: 'FORBIDDEN_INTERNAL' }));
  }
  next();
}
