import { createService } from '@deventure/service-kit';

/**
 * Esqueleto de progress-service: por ahora solo GET /health.
 * Las rutas (/progress/*, /admin/*, /internal/*) y Prisma se agregan en sus tickets.
 */
export function buildApp() {
  const app = createService({ name: 'progress-service' });

  return app.finalize();
}
