import { createService } from '@deventure/service-kit';
import cors from 'cors';
import { authenticate } from './middlewares/authenticate.js';
import { blockInternal } from './middlewares/blockInternal.js';
import { authLimiter, globalLimiter } from './middlewares/rateLimits.js';
import { stripIdentityHeaders } from './middlewares/stripIdentityHeaders.js';
import { registerProxies } from './routes/proxies.js';

/**
 * Única puerta de entrada al backend. Orden de los middlewares:
 * CORS → bloquear /internal → borrar headers de identidad falsos → rate limit → JWT → proxies.
 * No parsea el body (json: false): lo reenvía tal cual al servicio.
 *
 * @param {import('./config.js').GatewayConfig} config
 */
export function buildApp(config) {
  const app = createService({ name: 'api-gateway', json: false });

  app.use(
    cors({
      origin: config.CORS_ORIGIN.split(',').map((origin) => origin.trim()),
      exposedHeaders: ['x-correlation-id'],
    }),
  );
  app.use(blockInternal);
  app.use(stripIdentityHeaders);
  app.use('/api', globalLimiter(config.RATE_LIMIT_GLOBAL_MAX));
  app.use(['/api/auth/login', '/api/auth/register'], authLimiter(config.RATE_LIMIT_AUTH_MAX));
  app.use('/api', authenticate(config.JWT_SECRET));

  registerProxies(app, config);

  return app.finalize();
}
