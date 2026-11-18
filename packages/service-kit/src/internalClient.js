import { setTimeout as wait } from 'node:timers/promises';
import { AppError, ServiceUnavailableError } from './errors.js';
import { CORRELATION_HEADER } from './middlewares/correlationId.js';
import { INTERNAL_TOKEN_HEADER } from './middlewares/requireInternalToken.js';

const DEFAULT_TIMEOUT_MS = 3000;
const DEFAULT_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 200;
const NO_CONTENT_STATUS = 204;
const RETRYABLE_STATUSES = new Set([502, 503, 504]);

const isRetryableFailure = (failure) => !(failure instanceof AppError);

async function readResponse(response, serviceName) {
  if (response.status === NO_CONTENT_STATUS) return undefined;
  const responseBody = await response.json();
  if (response.ok) return responseBody.data;
  throw new AppError(responseBody.error.message, {
    status: response.status,
    code: responseBody.error.code,
    details: { ...responseBody.error.details, service: serviceName },
  });
}

export function createInternalClient({
  name,
  baseUrl,
  token,
  timeoutMs = DEFAULT_TIMEOUT_MS,
  retries = DEFAULT_RETRIES,
}) {
  async function sendOnce({ method, path, body, correlationId }) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        'content-type': 'application/json',
        [INTERNAL_TOKEN_HEADER]: token,
        [CORRELATION_HEADER]: correlationId ?? '',
      },
      body: body && JSON.stringify(body),
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (RETRYABLE_STATUSES.has(response.status)) {
      throw new Error(`${name} respondió ${response.status}`);
    }
    return readResponse(response, name);
  }

  async function sendWithRetries(request, attemptNumber = 0) {
    try {
      return await sendOnce(request);
    } catch (requestError) {
      if (!isRetryableFailure(requestError)) throw requestError;
      if (attemptNumber >= retries) {
        throw new ServiceUnavailableError(`El servicio ${name} no está disponible`, {
          code: 'SERVICE_UNAVAILABLE',
          details: { service: name, reason: requestError.message },
        });
      }
      await wait(RETRY_BASE_DELAY_MS * 2 ** attemptNumber);
      return sendWithRetries(request, attemptNumber + 1);
    }
  }

  return {
    get: (path, { correlationId } = {}) => sendWithRetries({ method: 'GET', path, correlationId }),
    post: (path, body, { correlationId } = {}) =>
      sendWithRetries({ method: 'POST', path, body, correlationId }),
    delete: (path, { correlationId } = {}) =>
      sendWithRetries({ method: 'DELETE', path, correlationId }),
    request: (method, path, body, { correlationId } = {}) =>
      sendWithRetries({ method, path, body, correlationId }),
  };
}
