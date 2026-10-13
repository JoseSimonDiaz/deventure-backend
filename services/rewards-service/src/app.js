import { createService } from '@deventure/service-kit';

export function buildApp() {
  const app = createService({ name: 'rewards-service' });

  return app.finalize();
}
