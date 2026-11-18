import { createInternalClient } from '@deventure/service-kit';
import { config } from '../config.js';

export const progressClient = createInternalClient({
  name: 'progress-service',
  baseUrl: config.PROGRESS_URL,
  token: config.INTERNAL_TOKEN,
});
