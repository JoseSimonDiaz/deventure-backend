import { randomUUID } from 'node:crypto';

export const CORRELATION_HEADER = 'x-correlation-id';
const VALID_ID = /^[\w-]{1,64}$/;

export function correlationId(req, res, next) {
  const incoming = req.get(CORRELATION_HEADER);
  req.correlationId = incoming && VALID_ID.test(incoming) ? incoming : randomUUID();
  res.setHeader(CORRELATION_HEADER, req.correlationId);
  next();
}
