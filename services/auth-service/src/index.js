import { startPendingCallsJob } from '@deventure/service-kit';
import { buildApp } from './app.js';
import { assistantClient } from './clients/assistant.client.js';
import { gameplayClient } from './clients/gameplay.client.js';
import { progressClient } from './clients/progress.client.js';
import { rewardsClient } from './clients/rewards.client.js';
import { config } from './config.js';
import { pendingCallRepository } from './repositories/pendingCall.repository.js';

const app = buildApp();
app.start(config.PORT);

startPendingCallsJob({
  repository: pendingCallRepository,
  clients: new Map([
    ['gameplay', gameplayClient],
    ['progress', progressClient],
    ['rewards', rewardsClient],
    ['assistant', assistantClient],
  ]),
  logger: app.locals.logger,
});
