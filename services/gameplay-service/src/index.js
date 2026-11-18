import { startPendingCallsJob } from '@deventure/service-kit';
import { buildApp } from './app.js';
import { progressClient } from './clients/progress.client.js';
import { rewardsClient } from './clients/rewards.client.js';
import { config } from './config.js';
import { startExpireSessionsJob } from './jobs/expireSessions.js';
import { pendingCallRepository } from './repositories/pendingCall.repository.js';

const app = buildApp();
app.start(config.PORT);

startExpireSessionsJob(app.locals.logger);
startPendingCallsJob({
  repository: pendingCallRepository,
  clients: new Map([
    ['progress', progressClient],
    ['rewards', rewardsClient],
  ]),
  logger: app.locals.logger,
});
