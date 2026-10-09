import { createService } from '@deventure/service-kit';

/**
 * Esqueleto de gameplay-service: por ahora solo GET /health.
 * Las rutas (/gameplay/*, /admin/*, /internal/*) y Prisma se agregan en sus tickets.
 */
export function buildApp() {
  const app = createService({ name: 'gameplay-service' });

  return app.finalize();
}
