# @deventure/service-kit

Código compartido por todos los microservicios: app Express base, logger, errores, health check,
validación con Zod, correlation-id y protección de rutas internas.

```js
import { z } from 'zod';
import {
  createService,
  loadConfig,
  validate,
  NotFoundError,
  requireUser,
} from '@deventure/service-kit';

const config = loadConfig(z.object({ PORT: z.coerce.number() }));
const app = createService({ name: 'mi-servicio', healthCheck: () => prisma.$queryRaw`SELECT 1` });

app.get(
  '/items/:id',
  requireUser,
  validate({ params: z.object({ id: z.string().uuid() }) }),
  handler,
);
app.start(config.PORT); // agrega 404 + errorHandler y hace listen
```

| Export                                                                                                                                                                 | Para qué                                                                                                       |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `createService({ name, version, healthCheck, json })`                                                                                                                  | Express con helmet, json 100kb, correlationId, pino-http y `GET /health`. `app.start(port)` / `app.finalize()` |
| `loadConfig(schema)`                                                                                                                                                   | Valida `process.env` con Zod; corta el arranque si falta algo                                                  |
| `validate({ body, params, query })`                                                                                                                                    | Middleware Zod → 400 `VALIDATION_ERROR`                                                                        |
| `ValidationError` 400 · `UnauthorizedError` 401 · `ForbiddenError` 403 · `NotFoundError` 404 · `ConflictError` 409 · `LockedError` 423 · `ServiceUnavailableError` 503 | `throw new NotFoundError('Nivel no encontrado')`                                                               |
| `requireInternalToken`                                                                                                                                                 | Rutas `/internal/*`: header `x-internal-token` = `INTERNAL_TOKEN`, si no 403                                   |
| `requireUser` / `requireRole('admin')`                                                                                                                                 | Lee `x-user-id` / `x-user-role` que pone el gateway → `req.user`                                               |
| `createLogger(name)` / `logger`                                                                                                                                        | pino (pretty en desarrollo, silencioso en tests, oculta passwords y tokens)                                    |

Todas las respuestas de error tienen la forma `{ "error": { "code", "message", "details"? } }`.

```bash
npm test -w @deventure/service-kit   # tests + cobertura (mínimo 80 %)
```
