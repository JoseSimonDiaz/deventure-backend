import pino from 'pino';

/** Campos que NUNCA se escriben en los logs. */
export const REDACT_PATHS = [
  'req.headers.authorization',
  'req.headers.cookie',
  'req.headers["x-internal-token"]',
  'password',
  'passwordHash',
  'token',
  '*.password',
  '*.passwordHash',
  '*.token',
];

/**
 * Crea un logger pino. En desarrollo usa pino-pretty; en tests queda en silencio.
 * @param {string} [name] nombre del servicio
 */
export function createLogger(name) {
  // Se lee al crear el logger (no al importar el módulo) para respetar el .env ya cargado
  const isTest = process.env.NODE_ENV === 'test' || Boolean(process.env.VITEST);
  const isDev = process.env.NODE_ENV === 'development';
  return pino({
    name,
    level: process.env.LOG_LEVEL ?? (isTest ? 'silent' : 'info'),
    redact: { paths: REDACT_PATHS, censor: '[REDACTED]' },
    ...(isDev && !isTest
      ? {
          transport: {
            target: 'pino-pretty',
            options: { colorize: true, translateTime: 'SYS:HH:MM:ss' },
          },
        }
      : {}),
  });
}

/** Logger por defecto (para scripts o código fuera de un request). */
export const logger = createLogger(process.env.SERVICE_NAME);
