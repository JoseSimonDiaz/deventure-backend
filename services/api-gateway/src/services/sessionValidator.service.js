import { userSessionSchema } from '@deventure/contracts';
import { UnauthorizedError, createInternalClient } from '@deventure/service-kit';

const SESSION_CACHE_TTL_MS = 30_000;
const SESSION_CACHE_MAX_ENTRIES = 10_000;
const NOT_FOUND_STATUS = 404;

const revokedSessionError = () =>
  new UnauthorizedError('Tu sesión ya no es válida. Iniciá sesión de nuevo', {
    code: 'SESSION_REVOKED',
  });

export function createSessionValidator(config) {
  const authClient = createInternalClient({
    name: 'auth-service',
    baseUrl: config.AUTH_URL,
    token: config.INTERNAL_TOKEN,
  });
  const cachedSessionVersions = new Map();

  function rememberSessionVersion(userId, sessionVersion) {
    if (cachedSessionVersions.size >= SESSION_CACHE_MAX_ENTRIES) cachedSessionVersions.clear();
    cachedSessionVersions.set(userId, {
      sessionVersion,
      expiresAt: Date.now() + SESSION_CACHE_TTL_MS,
    });
  }

  async function fetchSessionVersion(userId, correlationId) {
    try {
      const userSession = await authClient.get(`/internal/users/${userId}/session`, {
        correlationId,
      });
      return userSessionSchema.parse(userSession).sessionVersion;
    } catch (sessionLookupError) {
      if (sessionLookupError.status === NOT_FOUND_STATUS) throw revokedSessionError();
      throw sessionLookupError;
    }
  }

  const isCachedVersion = (userId, tokenVersion) => {
    const cachedSession = cachedSessionVersions.get(userId);
    return (
      Boolean(cachedSession) &&
      cachedSession.expiresAt > Date.now() &&
      cachedSession.sessionVersion === tokenVersion
    );
  };

  return async function assertSessionIsCurrent({ userId, tokenVersion, correlationId }) {
    if (isCachedVersion(userId, tokenVersion)) return;
    const currentVersion = await fetchSessionVersion(userId, correlationId);
    rememberSessionVersion(userId, currentVersion);
    if (currentVersion !== tokenVersion) throw revokedSessionError();
  };
}
