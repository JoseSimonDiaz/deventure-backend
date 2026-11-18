import { createService } from '@deventure/service-kit';
import { prisma } from './db.js';
import { internalRouter } from './routes/internal.routes.js';
import { progressRouter } from './routes/progress.routes.js';

export function buildApp() {
  const app = createService({
    name: 'progress-service',
    healthCheck: () => prisma.$queryRaw`SELECT 1`,
  });

  app.use('/progress', progressRouter);
  app.use('/internal', internalRouter);

  return app.finalize();
}
