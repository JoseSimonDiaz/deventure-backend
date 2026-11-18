import { createInternalClient } from '@deventure/service-kit';
import { config } from '../config.js';

export const gameplayClient = createInternalClient({
  name: 'gameplay-service',
  baseUrl: config.GAMEPLAY_URL,
  token: config.INTERNAL_TOKEN,
});
