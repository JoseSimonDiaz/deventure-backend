import { createInternalClient } from '@deventure/service-kit';
import { config } from '../config.js';

export const rewardsClient = createInternalClient({
  name: 'rewards-service',
  baseUrl: config.REWARDS_URL,
  token: config.INTERNAL_TOKEN,
});
