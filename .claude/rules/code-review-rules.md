# Reglas de código

Reglas obligatorias para todo cambio. Salen de las observaciones de code review en proyectos
anteriores del equipo (RollingCode Platform, Student Manager, ipacym, ipaat, Cooperativa) y de
las decisiones de Deventure. No son preferencias de estilo: cada una se rompió alguna vez y costó
tiempo de review.

Las marcadas con **[ESLint]** las hace cumplir `packages/eslint-config` y `npm run lint` falla si
se violan. Las demás se revisan a mano en el PR.

Cuando llega una review: anotar cada comentario en `.claude/reviews/DEV-XX.md` (estado ⏳/✅) y,
si deja una lección general, agregarla acá con su origen `_(DEV-XX #n)_`.

## 1. Backend: sin loops ni métodos de iteración

- **[ESLint]** Nada de `for`, `for...of`, `for...in`, `while`, `do...while`.
- **[ESLint]** Nada de `map`, `filter`, `some`, `every`, `find`, `findIndex`, `reduce`, `forEach`,
  `sort`, `flatMap`.
- Cómo se resuelve en su lugar:
  - **Filtrar, ordenar, paginar, agregar o deduplicar** → en la base: `where`, `orderBy`,
    `take`/`skip`, `groupBy`, `_count`, `_sum`, `distinct`, o `$queryRaw` con `GROUP BY`/`jsonb_agg`.
  - **Dar forma a la respuesta** → que la consulta devuelva la forma final (`select` de Prisma o
    `$queryRaw`). No transformar filas en JS después de leerlas.
  - **Escribir varios registros** → `createMany` (`skipDuplicates`), `updateMany`, `upsert` o
    `INSERT ... SELECT`.
  - **Buscar por clave o despachar por tipo** → `Map`/`Set`: `VALIDATORS.get(challengeType)`,
    `PUBLIC_ROUTES.has(routeKey)`.
  - **Una lista corta y fija** (5 servicios, 4 headers) → llamadas explícitas, una por línea.
- Aplica a `services/**` y `packages/**` (incluye seeds). No aplica a los tests ni a `apps/web`,
  donde `map` para renderizar listas está permitido.

## 2. Nombres

- **[ESLint]** Nada de nombres de una letra (`a`, `b`, `e`, `u`, `i`, `t`), tampoco en callbacks ni
  en `catch`: `(issue) =>`, `catch (seedError)`, `(originList) =>`.
- Nombres autoexplicativos que digan **qué** y **de qué**: `receivedToken`/`expectedToken`, no
  `bufA`/`bufB`. `rollingPlusPreapprovalPlanId`, no `planId`. `isPublicRoute`, no `check`.
- Booleanos con `is`/`has`/`can`/`should`: `isLocked`, `hasSeenIntro`.
- Funciones con verbo + objeto: `findUserByIdentifier`, `registerServiceRoutes`.
- Parámetros con el dominio: `userId`, `levelId`, no `id` suelto cuando hay más de uno en juego.

## 3. Logs y errores

- **[ESLint]** Nada de `console.log`/`console.error`. Usar `req.log` dentro de un request, o
  `logger`/`app.locals.logger` de `@deventure/service-kit` fuera de uno.
- **[ESLint]** Nada de `catch {}` vacío.
- No tragarse errores: un `try/catch` que solo loguea y sigue esconde la falla. Tampoco
  `try/catch` que solo vuelve a lanzar. Se lanza una subclase de `AppError` y el `errorHandler`
  responde.
- Si se decide continuar a pesar de un error, se hace en el service, con `logger.error` que
  incluya el contexto para actuar (ids, `userId`, `correlationId`), y queda explícito.
- Los controllers no vuelven a chequear lo que devuelve un service: si el service no lanzó, el
  resultado es válido. El "no encontrado" lo lanza el service (`NotFoundError`).
- No usar `safeParse` + `if (!success) throw` cuando el `errorHandler` ya traduce el `ZodError`:
  usar `.parse()`.

## 4. Comparaciones y control de flujo

- **[ESLint]** No comparar contra `null`, `undefined`, `'true'` ni `'false'`. Para saber si una
  clave vino en el body usar `Object.hasOwn(body, 'clave')`; para valores, que Zod lo resuelva
  (`.default()`, `.optional()`, `z.coerce.boolean()`).
- **[ESLint]** Sin `if` anidados: early return.
- **[ESLint]** Sin ternarios anidados.
- No usar `?.` defensivo sobre datos garantizados (por el `select` de Prisma o el esquema Zod).
  Esconde bugs: un campo que falta da `undefined` silencioso en vez de un error claro.
- No leer resultados de regex por posición (`match[1]`): usar grupos con nombre
  (`(?<index>\d+)`) y `.groups.index`.
- No armar `Promise.resolve(x)` falsos para meter una consulta condicional en `Promise.all`.
- Funciones cortas (≤ 20 líneas como referencia) y con una sola responsabilidad.

## 5. Constantes, sin valores mágicos

- Ningún string ni número de negocio suelto en la lógica: va en una constante con nombre
  (`MAX_FAILED_LOGINS`, `SEED_BCRYPT_ROUNDS`, `LOCK_DURATION_MS`). Las rutas de la API y los
  valores estándar del lenguaje pueden quedar inline.
- Usar los enums que ya existen (`Role` de Prisma, `Prisma.SortOrder.desc`) en vez de literales.
- Antes de crear una constante, buscar si ya existe (`grep -rn`). No duplicar.

## 6. Comentarios

- No agregar comentarios (`//` ni `/** */`) en código nuevo o modificado. Los nombres de funciones
  y variables, y el mensaje de un `throw` o `logger.error`, explican el porqué.
- El código JS del repo no tiene comentarios ni JSDoc. Los comentarios del `schema.prisma`, de
  los SQL y de los YAML de infraestructura sí se mantienen: documentan el modelo de datos y la
  infraestructura, no código.
- Antes de cerrar un cambio: `git diff -- <archivos> | grep -E '^\+\s*(//|/\*|\*)'` y sacar lo que
  se haya agregado.

## 7. Capas y responsabilidades

- `routes → controllers → services → repositories`.
  - **Routes:** registran endpoints y componen middlewares (`validate`, `requireUser`,
    `requireRole`). Sin lógica.
  - **Controllers:** solo traducen HTTP ↔ service. Desestructuran el input de `req` al principio,
    llaman al service y responden `{ data }`. Nunca tocan `prisma`.
  - **Services:** toda la lógica de negocio. No reciben `req` ni `res`. Exportan funciones con
    nombre. Sin dependencias circulares entre services.
  - **Repositories:** el único lugar que usa `prisma`.
- Sin mappers en JS: la forma pública la arma la consulta (`select` o `$queryRaw`). Las etiquetas
  legibles para el usuario se resuelven en el frontend.
- Sin wrappers finos: una función que solo llama a otra sin agregar lógica no existe.
- La validación de entrada va en `validate({ body, params, query })` con esquemas de
  `@deventure/contracts`, no en los services. Los clientes de servicios externos o internos
  tampoco validan parámetros.
- Los servicios no validan JWT: confían en `requireUser` (headers que pone el gateway).
- Nada de foreign keys ni consultas a la base de otro servicio: se llama a su `/internal/*`.
- Un solo cliente HTTP configurado por servicio destino (base URL + headers), no repetir la URL y
  el header en cada función.
- Antes de crear un archivo, util o helper nuevo, verificar que el patrón no exista ya.

## 8. API REST

- Solo rutas sobre recursos. Nada de rutas de acción tipo RPC (`/sessions/:id/abandon`): usar
  `PATCH` o `DELETE` sobre el recurso con un discriminador en el body (`{ status: 'abandoned' }`).
- Filtrado, orden, paginación y agregación en el backend con query params validados con Zod
  (`paginationSchema` de contracts). El cliente pide una página; nunca recibe todo para cortarlo.
- Los parámetros de query se leen todos al principio del handler (`req.validated.query`), nunca a
  mitad de la función.
- Respuesta OK `{ data }`, error `{ error: { code, message, details? } }` con un `code` estable.
- Si un id viene del cliente, validar que el recurso corresponde al flujo y al usuario, no solo que
  exista. Esa validación va antes de tocar estado o llamar a otro servicio.

## 9. Datos y concurrencia

- Toda operación que lee y escribe el mismo dato (vidas, intentos, desbloqueos, recompensas) es
  atómica en la base: `UPDATE ... RETURNING`, `upsert`, transacción o `version` optimista.
- Los endpoints internos que escriben son idempotentes (por `sessionId` o `userId`).
- Antes de pasar datos grandes a una consulta, seleccionar solo los campos necesarios.

## 10. Configuración y variables de entorno

- No agregar variables de entorno que el ticket no pida. Antes de crear una, buscar si ya existe
  (`grep -rn "process.env\|loadConfig" services packages`, `.env.example`).
- Toda variable nueva va en el esquema Zod de `src/config.js` del servicio (con `loadConfig`), con
  su transformación (ej. `CORS_ORIGIN` → array), y en el `.env.example` correspondiente. Nunca leer
  `process.env.X` suelto en la lógica.
- No encadenar fallbacks entre variables (`A || B`). Una responsabilidad = una variable.
- Una feature de producción nunca usa una variable pensada para testing.
- Si dos funciones necesitan el mismo dato de config, leen la misma constante.

## 11. Alcance del cambio

- Al resolver un comentario de review, tocar solo lo que ese comentario señala.
- No "aprovechar" para renombrar, reordenar o unificar código ajeno al ticket.
- Antes de cerrar, `git diff main -- <archivo>` y confirmar que el diff es el mínimo necesario.
- Sin código especulativo ni placeholders (YAGNI). El código muerto se borra.

## 12. Proceso

- Antes de afirmar cómo se comporta una librería o API externa, verificarlo (context7, docs
  oficiales o una prueba) y citar la fuente.
- Los tests no son obligatorios por ahora (decisión del equipo). Los que existen se mantienen en
  verde. Cada ticket se prueba a mano (curl, `docs/api/*.http`, navegador) y el PR dice cómo.
- Al terminar: `npm run lint` sin errores y `npm run format:check` OK.

## 13. Frontend (`apps/web`, cuando exista)

- Ninguna llamada HTTP en componentes: todas viven en `src/services/`, con un único cliente
  configurado.
- No filtrar, ordenar ni agregar datos en el cliente: pedirlo al backend con query params.
- Sin funciones inline en el JSX (`onClick={() => ...}`): declararlas en el cuerpo del componente.
- Sin lógica tipo util dentro de componentes: extraerla a `src/utils/`.
- Textos, rutas y valores de configuración en `src/constants/`. Reusar las etiquetas existentes.
- Esquemas de formularios desde `@deventure/contracts` (`zodResolver`).
- Los mensajes de error del backend se muestran solo para los códigos de negocio esperados
  (400, 403, 409, 423, 429). Ante un 500 se muestra un mensaje genérico, nunca el mensaje crudo.
- Textos legibles: nada de fuentes menores a 14px.
