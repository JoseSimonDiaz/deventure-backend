import { createService } from '@deventure/service-kit';
import compression from 'compression';
import cors from 'cors';
import { authenticate } from './middlewares/authenticate.js';
import { blockInternal } from './middlewares/blockInternal.js';
import { createRateLimiter } from './middlewares/rateLimits.js';
import { stripIdentityHeaders } from './middlewares/stripIdentityHeaders.js';
import { registerAdminStats } from './routes/adminStats.js';
import { registerProxies } from './routes/proxies.js';
import { createSessionValidator } from './services/sessionValidator.service.js';

export function buildApp(config) {
  const app = createService({ name: 'api-gateway', json: false });

  app.use(
    cors({
      origin: config.CORS_ORIGIN,
      exposedHeaders: ['x-correlation-id'],
    }),
  );
  app.use(compression());
  app.use(blockInternal);
  app.use(stripIdentityHeaders);
  app.use('/api', createRateLimiter(config.RATE_LIMIT_GLOBAL_MAX));
  app.use(['/api/auth/login', '/api/auth/register'], createRateLimiter(config.RATE_LIMIT_AUTH_MAX));
  app.use(
    '/api',
    authenticate({
      secret: config.JWT_SECRET,
      assertSessionIsCurrent: createSessionValidator(config),
    }),
  );

  registerAdminStats(app, config);
  registerProxies(app, config);

  return app.finalize();
}
