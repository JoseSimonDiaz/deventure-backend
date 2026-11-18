import { createInternalClient, logger } from '@deventure/service-kit';

const FULFILLED = 'fulfilled';

function readSettled(settledResult, source) {
  if (settledResult.status === FULFILLED) return settledResult.value;
  logger.warn(
    { err: settledResult.reason, source },
    'Estadísticas parciales: un servicio no respondió',
  );
  return null;
}

export function createAdminStatsService(config) {
  const clientOptions = {
    token: config.INTERNAL_TOKEN,
    timeoutMs: config.STATS_TIMEOUT_MS,
    retries: 0,
  };
  const authClient = createInternalClient({
    ...clientOptions,
    name: 'auth-service',
    baseUrl: config.AUTH_URL,
  });
  const gameplayClient = createInternalClient({
    ...clientOptions,
    name: 'gameplay-service',
    baseUrl: config.GAMEPLAY_URL,
  });
  const progressClient = createInternalClient({
    ...clientOptions,
    name: 'progress-service',
    baseUrl: config.PROGRESS_URL,
  });

  return async function getAdminStats({ queryString, correlationId }) {
    const requestOptions = { correlationId };
    const [usersResult, levelsResult, completionsResult] = await Promise.allSettled([
      authClient.get(`/internal/stats/users${queryString}`, requestOptions),
      gameplayClient.get(`/internal/stats/levels${queryString}`, requestOptions),
      progressClient.get(`/internal/stats/completions${queryString}`, requestOptions),
    ]);
    const stats = {
      users: readSettled(usersResult, 'auth'),
      gameplay: readSettled(levelsResult, 'gameplay'),
      progress: readSettled(completionsResult, 'progress'),
    };
    return { ...stats, partial: Object.values(stats).includes(null) };
  };
}
