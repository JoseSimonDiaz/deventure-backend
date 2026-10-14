import { createService } from '@deventure/service-kit';
import { prisma } from './db.js';
import { contentRouter } from './routes/content.routes.js';
import { internalRouter } from './routes/internal.routes.js';

export function buildApp() {
  const app = createService({
    name: 'content-service',
    healthCheck: () => prisma.$queryRaw`SELECT 1`,
  });

  app.use('/content', contentRouter);
  app.use('/internal', internalRouter);

  return app.finalize();
}
