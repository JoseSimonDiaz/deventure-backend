import pino from 'pino';

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

export function createLogger(name) {
<<<<<<< HEAD
=======
  // Se lee al crear el logger (no al importar el módulo) para respetar el .env ya cargado
>>>>>>> 91d40d8 (Development (#1))
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

export const logger = createLogger(process.env.SERVICE_NAME);
