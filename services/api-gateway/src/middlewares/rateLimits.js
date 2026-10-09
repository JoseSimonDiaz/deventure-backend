import { rateLimit } from 'express-rate-limit';

const tooManyRequests = (_req, res) => {
  res.status(429).json({
    error: { code: 'TOO_MANY_REQUESTS', message: 'Demasiados pedidos. Esperá un minuto.' },
  });
};

/** Límite general por IP para toda la API. */
export const globalLimiter = (max) =>
  rateLimit({
    windowMs: 60_000,
    limit: max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: tooManyRequests,
  });

/** Límite estricto para login y registro (frena ataques de fuerza bruta). */
export const authLimiter = (max) =>
  rateLimit({
    windowMs: 60_000,
    limit: max,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: tooManyRequests,
  });
