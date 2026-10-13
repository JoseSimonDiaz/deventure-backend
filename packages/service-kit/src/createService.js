import express from 'express';
import helmet from 'helmet';
import { pinoHttp } from 'pino-http';
import { createLogger } from './logger.js';
import { healthHandler } from './health.js';
import { correlationId } from './middlewares/correlationId.js';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler.js';

const JSON_BODY_LIMIT = '100kb';

export function createService({ name, version = '1.0.0', healthCheck, json = true }) {
  const app = express();
  const logger = createLogger(name);

  app.disable('x-powered-by');
  app.set('trust proxy', 1);
  app.locals.logger = logger;

  app.use(helmet());
  if (json) app.use(express.json({ limit: JSON_BODY_LIMIT }));
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

  app.finalize = () => {
    if (!finalized) {
      app.use(notFoundHandler);
      app.use(errorHandler);
      finalized = true;
    }
    return app;
  };

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
