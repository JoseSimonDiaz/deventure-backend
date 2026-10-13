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

export function requireInternalToken(req, _res, next) {
  const expected = process.env.INTERNAL_TOKEN;
  const received = req.get(INTERNAL_TOKEN_HEADER);
  if (!expected || !received || !safeEqual(received, expected)) {
    return next(new ForbiddenError('Token interno inválido', { code: 'FORBIDDEN_INTERNAL' }));
  }
  next();
}
