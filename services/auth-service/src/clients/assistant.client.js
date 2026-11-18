import { createInternalClient } from '@deventure/service-kit';
import { config } from '../config.js';

export const assistantClient = createInternalClient({
  name: 'assistant-service',
  baseUrl: config.ASSISTANT_URL,
  token: config.INTERNAL_TOKEN,
});
