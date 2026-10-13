import { createService } from '@deventure/service-kit';
import { prisma } from './db.js';
import { authRouter } from './routes/auth.routes.js';

export function buildApp() {
  const app = createService({
    name: 'auth-service',
    healthCheck: () => prisma.$queryRaw`SELECT 1`,
  });

  app.use('/auth', authRouter);

  return app.finalize();
}
