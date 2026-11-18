const MS_PER_SECOND = 1000;
const MS_PER_HOUR = 60 * 60 * MS_PER_SECOND;
const MS_PER_DAY = 24 * MS_PER_HOUR;

export const PENDING_CALLS_INTERVAL_MS = 30 * MS_PER_SECOND;
export const PENDING_CALLS_MAX_ATTEMPTS = 10;
export const PENDING_CALLS_BATCH_SIZE = 20;
const RETRY_BASE_DELAY_MS = 30 * MS_PER_SECOND;
const CLEANUP_INTERVAL_MS = MS_PER_HOUR;
const DONE_RETENTION_MS = 7 * MS_PER_DAY;

export function startPendingCallsJob({ repository, clients, logger }) {
  async function registerFailure(pendingCall, failure) {
    const attempts = pendingCall.attempts + 1;
    if (attempts >= PENDING_CALLS_MAX_ATTEMPTS) {
      logger.error(
        {
          pendingCallId: pendingCall.id,
          target: pendingCall.target,
          path: pendingCall.path,
          err: failure,
        },
        'Llamada interna descartada tras el máximo de reintentos',
      );
      return repository.markFailed(pendingCall.id, { attempts, lastError: failure.message });
    }
    return repository.markForRetry(pendingCall.id, {
      attempts,
      lastError: failure.message,
      nextRetryAt: new Date(Date.now() + RETRY_BASE_DELAY_MS * 2 ** attempts),
    });
  }

  async function retryPendingCall(pendingCall) {
    try {
      await clients
        .get(pendingCall.target)
        .request(pendingCall.method, pendingCall.path, pendingCall.body, {
          correlationId: pendingCall.correlationId,
        });
      await repository.markDone(pendingCall.id);
    } catch (retryError) {
      await registerFailure(pendingCall, retryError);
    }
  }

  async function processDueCalls(remainingCalls = PENDING_CALLS_BATCH_SIZE) {
    if (remainingCalls === 0) return;
    const pendingCall = await repository.findNextDue(new Date());
    if (!pendingCall) return;
    await retryPendingCall(pendingCall);
    await processDueCalls(remainingCalls - 1);
  }

  const logJobError = (jobError) =>
    logger.error({ err: jobError }, 'Falló el job de llamadas internas pendientes');

  const retryTimer = setInterval(
    () => processDueCalls().catch(logJobError),
    PENDING_CALLS_INTERVAL_MS,
  );
  const cleanupTimer = setInterval(
    () => repository.deleteDoneBefore(new Date(Date.now() - DONE_RETENTION_MS)).catch(logJobError),
    CLEANUP_INTERVAL_MS,
  );
  retryTimer.unref();
  cleanupTimer.unref();
}
