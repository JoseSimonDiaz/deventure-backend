import { createService } from '@deventure/service-kit';

/**
 * Esqueleto de content-service: por ahora solo GET /health.
 * Las rutas (/content/*, /admin/*, /internal/*) y Prisma se agregan en sus tickets.
 */
export function buildApp() {
  const app = createService({ name: 'content-service' });

  return app.finalize();
}
