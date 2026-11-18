import { createService } from '@deventure/service-kit';
import { prisma } from './db.js';
import { assistantRouter, internalRouter } from './routes/assistant.routes.js';

export function buildApp() {
  const app = createService({
    name: 'assistant-service',
    healthCheck: () => prisma.$queryRaw`SELECT 1`,
  });

  app.use('/assistant', assistantRouter);
  app.use('/internal', internalRouter);

  return app.finalize();
}
