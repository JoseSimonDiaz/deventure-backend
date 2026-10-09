import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { createLogger } from './logger.js';
import { healthHandler } from './health.js';
import { correlationId } from './middlewares/correlationId.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

/**
 * Crea la app Express base de un microservicio, con los middlewares comunes en este orden:
 * helmet → express.json (100kb) → correlationId → pino-http → GET /health.
 *
 * Después de registrar tus rutas llamá a `app.start(port)` (o `app.finalize()` en los tests),
 * que agrega al final el handler 404 y el errorHandler.
 *
 * @param {{
 *   name: string,
 *   version?: string,
 *   healthCheck?: () => Promise<unknown>,
 *   json?: boolean,
 * }} options `json: false` desactiva express.json (lo usa el gateway, que reenvía el body tal cual).
 */
export function createService({ name, version = '1.0.0', healthCheck, json = true }) {
  const app = express();
  const logger = createLogger(name);

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.locals.logger = logger;

  app.use(helmet());
  if (json) app.use(express.json({ limit: '100kb' }));
  app.use(correlationId);
  app.use(
    pinoHttp({
      logger,
      genReqId: (req) => req.correlationId,
      autoLogging: { ignore: (req) => req.url === '/health' },
    }),
  );
  app.get('/health', healthHandler({ name, version, healthCheck }));

  let finalized = false;

  /** Agrega 404 + errorHandler (una sola vez). Devuelve la app para usarla en tests. */
  app.finalize = () => {
    if (!finalized) {
      app.use(notFoundHandler);
      app.use(errorHandler);
      finalized = true;
    }
    return app;
  };

  /** Finaliza la app y escucha en el puerto indicado. Devuelve el `http.Server`. */
  app.start = (port) => {
    app.finalize();
    const server = app.listen(port, () => logger.info(`${name} escuchando en el puerto ${port}`));
    const shutdown = () => {
      logger.info(`${name} apagándose...`);
      server.close(() => process.exit(0));
    };
    process.once('SIGTERM', shutdown);
    process.once('SIGINT', shutdown);
    return server;
  };

  return app;
}
