import { createService } from '@deventure/service-kit';

/**
 * Esqueleto de rewards-service: por ahora solo GET /health.
 * Las rutas (/rewards/*, /admin/*, /internal/*) y Prisma se agregan en sus tickets.
 */
export function buildApp() {
  const app = createService({ name: 'rewards-service' });

  return app.finalize();
}
