import { randomUUID } from 'node:crypto';

export const CORRELATION_HEADER = 'x-correlation-id';
const VALID_ID = /^[\w-]{1,64}$/;

/**
 * Asigna un id de correlación a cada request (req.correlationId) y lo devuelve en la respuesta.
 * Si el request ya trae uno válido (lo pone el gateway), lo reutiliza para seguir la traza entre
 * servicios; si viene vacío, largo o con caracteres raros, genera un UUID nuevo.
 */
export function correlationId(req, res, next) {
  const incoming = req.get(CORRELATION_HEADER);
  req.correlationId = incoming && VALID_ID.test(incoming) ? incoming : randomUUID();
  res.setHeader(CORRELATION_HEADER, req.correlationId);
  next();
}
