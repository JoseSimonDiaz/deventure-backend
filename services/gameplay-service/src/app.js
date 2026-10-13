import { createService } from '@deventure/service-kit';

export function buildApp() {
  const app = createService({ name: 'gameplay-service' });

  return app.finalize();
}
