import { createService } from '@deventure/service-kit';

export function buildApp() {
  const app = createService({ name: 'content-service' });

  return app.finalize();
}
