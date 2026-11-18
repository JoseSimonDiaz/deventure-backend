import { createService } from '@deventure/service-kit';
import { prisma } from './db.js';
import { internalRouter } from './routes/internal.routes.js';
import { rewardsRouter } from './routes/rewards.routes.js';

export function buildApp() {
  const app = createService({
    name: 'rewards-service',
    healthCheck: () => prisma.$queryRaw`SELECT 1`,
  });

  app.use('/rewards', rewardsRouter);
  app.use('/internal', internalRouter);

  return app.finalize();
}
