import { rateLimit } from 'express-rate-limit';

const RATE_LIMIT_WINDOW_MS = 60_000;
const TOO_MANY_REQUESTS_STATUS = 429;

const rejectTooManyRequests = (_req, res) => {
  res.status(TOO_MANY_REQUESTS_STATUS).json({
    error: { code: 'TOO_MANY_REQUESTS', message: 'Demasiados pedidos. Esperá un minuto.' },
  });
};

export const createRateLimiter = (maxRequestsPerWindow) =>
  rateLimit({
    windowMs: RATE_LIMIT_WINDOW_MS,
    limit: maxRequestsPerWindow,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    handler: rejectTooManyRequests,
  });
