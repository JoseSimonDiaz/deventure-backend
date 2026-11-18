import { createInternalClient } from '@deventure/service-kit';
import { config } from '../config.js';

export const contentClient = createInternalClient({
  name: 'content-service',
  baseUrl: config.CONTENT_URL,
  token: config.INTERNAL_TOKEN,
});
