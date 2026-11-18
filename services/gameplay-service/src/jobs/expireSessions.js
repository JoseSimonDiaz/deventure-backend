import { expireOldSessions } from '../services/session.service.js';

const EXPIRE_SESSIONS_INTERVAL_MS = 10 * 60 * 1000;

export function startExpireSessionsJob(logger) {
  const expireTimer = setInterval(async () => {
    try {
      const expiredCount = await expireOldSessions();
      if (expiredCount > 0) logger.info({ expiredCount }, 'Sesiones abiertas pasadas a abandoned');
    } catch (jobError) {
      logger.error({ err: jobError }, 'Falló el job que vence sesiones abiertas');
    }
  }, EXPIRE_SESSIONS_INTERVAL_MS);
  expireTimer.unref();
}
