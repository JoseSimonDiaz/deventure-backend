import { createService } from '@deventure/service-kit';

export function buildApp() {
  const app = createService({ name: 'progress-service' });

  return app.finalize();
}
