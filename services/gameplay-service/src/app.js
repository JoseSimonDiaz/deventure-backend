import { createService } from '@deventure/service-kit';
import { prisma } from './db.js';
import { adminRouter } from './routes/admin.routes.js';
import { gameplayRouter } from './routes/gameplay.routes.js';
import { internalRouter } from './routes/internal.routes.js';

export function buildApp() {
  const app = createService({
    name: 'gameplay-service',
    healthCheck: () => prisma.$queryRaw`SELECT 1`,
  });

  app.use('/gameplay', gameplayRouter);
  app.use('/admin', adminRouter);
  app.use('/internal', internalRouter);

  return app.finalize();
}
