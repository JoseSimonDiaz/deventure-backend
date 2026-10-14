# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Deventure: juego web educativo de programación (tesis, equipo de 4). Monorepo npm workspaces con
microservicios Express 5 en JavaScript ESM (Node 22, **sin TypeScript**: los contratos de datos
son los esquemas Zod de `packages/contracts`). Las decisiones de stack están en
`docs/adr/ADR-001-stack-y-arquitectura.md` y las reglas de código en `ADR-002`: leerlos antes de
proponer cambios de arquitectura. El código, los mensajes de error y los commits van en
**español**. `docs/analisis-funcional.md` describe QUÉ construir (reglas de negocio y backlog).

## Reglas de código (obligatorias)

@.claude/rules/code-review-rules.md

Lo más importante, que `npm run lint` hace cumplir en `services/**` y `packages/**`: **sin loops ni
`map`/`filter`/`some`/`find`/`reduce`/`forEach`/`sort`** (resolverlo en la base o con `Map`/`Set`),
**sin nombres de una letra**, **sin `console`**, sin `if` anidados y sin comparar contra
`null`/`undefined`. **Sin comentarios ni JSDoc** en el código JS (el repo está limpio: no
volver a agregarlos).

Las observaciones abiertas de cada ticket viven en `.claude/reviews/DEV-XX.md`. Al trabajar un
ticket, leer su archivo si existe.

## Comandos

```bash
npm install                      # también corre `prisma generate` (postinstall de auth-service)
npm run db:up                    # Postgres 16 en Docker (crea las 5 bases vía infra/postgres/init.sql)
npm run db:reset                 # borra el volumen y recrea las bases
npm run dev                      # gateway + 5 servicios con `node --watch`
npm run dev:all / npm run down   # todo en Docker Compose (necesita .env en la raíz)

npm run lint                     # ESLint (flat config de packages/eslint-config)
npm run format:check             # Prettier (CI falla si no está formateado)
npm test                         # vitest en todos los workspaces (--passWithNoTests)

npm test -w @deventure/auth-service                       # un workspace
npx vitest run tests/<archivo>.test.js (dentro del workspace) # un archivo
npx vitest run -t "nombre del test" (dentro del workspace) # un test por nombre

npm run db:migrate -w @deventure/auth-service -- --name <nombre>   # nueva migración Prisma
npm run db:deploy  -w @deventure/auth-service
npm run db:seed    -w @deventure/auth-service   # admin/Admin1234, demo/Demo1234
```

- **Los tests no son obligatorios** (decisión del equipo): no agregar Vitest/Playwright a un
  ticket sin preguntar. Los tests existentes (gateway, contracts, health) se mantienen en verde y
  se pueden usar como red de seguridad al refactorizar. Los de auth-service usarían una base real
  separada (`auth_db_test`, requiere `npm run db:up`).
- **Cada ticket se prueba a mano** (curl, `docs/api/*.http` con REST Client contra
  `localhost:3000`, o navegador) y el PR muestra cómo. Antes de cerrar: `npm run lint` con 0
  errores y `npm run format:check` OK.
- Husky: `pre-commit` corre lint-staged (eslint --fix + prettier); `commit-msg` corre commitlint.

## Convenciones de git

- Commits Conventional con **scope obligatorio de la lista** de `commitlint.config.js`:
  `web, gateway, auth, content, gameplay, progress, rewards, kit, contracts, infra, repo, ci, docs`.
  Ej: `feat(auth): bloquear cuenta tras 5 intentos fallidos`.
- Ramas `feature/DEV-XX-descripcion`, PR a `main` (template en `.github/pull_request_template.md`
  con link a la tarjeta de Trello), squash and merge.
- CI (`.github/workflows/ci.yml`) solo testea los workspaces que cambiaron; si cambia
  `packages/**`, `package.json` o el lockfile, testea todos. También valida cada
  `services/*/prisma/schema.prisma`. Al agregar un servicio o paquete nuevo hay que sumarlo a
  los filtros y a la lista `ALL` de ese workflow.

## Arquitectura

### Flujo de un request

```
cliente → api-gateway :3000 (/api/*) ──REST──> <servicio> :300X (/<servicio>/*, /admin/*)
                                       servicio ──/internal/* + x-internal-token──> otro servicio
```

- **api-gateway** es la única entrada pública. Orden de middlewares (`services/api-gateway/src/app.js`):
  CORS → `blockInternal` (cualquier `/internal` → 404) → `stripIdentityHeaders` → rate limit →
  `authenticate` (JWT HS256) → proxies. No parsea el body (`createService({ json: false })`).
- `routes/proxies.js` reescribe `/api/<svc>/*` → `<svc>/<svc>/*` y `/api/admin/<svc>/*` →
  `<svc>/admin/*` (este último exige rol admin en el gateway). Quita `Authorization` y agrega
  `x-user-id`, `x-user-role`, `x-user-name`, `x-correlation-id`.
- Rutas públicas sin JWT: lista `PUBLIC_ROUTES` en `middlewares/authenticate.js` — una ruta
  pública nueva se agrega ahí.
- **Los servicios no validan JWT**: usan `requireUser` / `requireRole` de service-kit, que leen
  los headers que puso el gateway. Las rutas `/internal/*` se protegen con `requireInternalToken`.
- Comunicación **solo REST**, sin colas ni eventos. Una base Postgres por servicio, sin foreign
  keys entre servicios (ids ajenos se guardan como `uuid` sueltos).

### `packages/service-kit` (base de todo servicio)

- `createService({ name, healthCheck })` arma helmet → `express.json` (100kb) → correlationId →
  pino-http → `GET /health`. Después de registrar rutas se llama `app.finalize()` (agrega 404 +
  `errorHandler`); `app.start(port)` finaliza y escucha con shutdown en SIGTERM/SIGINT.
- Patrón de cada servicio: `src/app.js` exporta `buildApp()` que devuelve `app.finalize()` (lo
  usan los tests con supertest), y `src/index.js` hace `buildApp().start(config.PORT)`.
- `src/config.js` de cada servicio valida env con `loadConfig(zodSchema)` (carga el `.env` local
  sin pisar variables ya definidas y corta el arranque si algo falta).
- Errores: lanzar `ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`,
  `ConflictError`, `LockedError`, `ServiceUnavailableError` (o `AppError` con `status`/`code`).
  El `errorHandler` responde siempre `{ "error": { "code", "message", "details"? } }`; respuestas
  OK van envueltas en `{ "data": ... }`. En `VALIDATION_ERROR`, `details` es
  `{ campo: [mensajes] }` (`ZodError.flatten().fieldErrors`). Los casos conocidos (Prisma
  P2002/P2025, JSON inválido, body muy grande) se despachan con un `Map` en el `errorHandler`.
- `validate({ body, params, query })` con Zod: reemplaza `req.body`/`req.params` y deja todo en
  `req.validated` (en Express 5 `req.query` es de solo lectura → usar `req.validated.query`).

### `packages/contracts`

Esquemas Zod compartidos front/back. Todo endpoint que recibe o devuelve datos define su esquema
acá y se reusa en `validate(...)` (backend) y `zodResolver(...)` (frontend).

### Estructura interna de un servicio (referencia: `services/auth-service`)

`routes → controllers → services → repositories`. Controllers solo traducen HTTP ↔ service; la
lógica está en `services/`; solo `repositories/` usa `prisma`, y la consulta (`select` o
`$queryRaw`) devuelve la forma pública (ej. `PUBLIC_USER_SELECT` en `user.repository.js`).
`src/db.js` exporta un único `PrismaClient` (auth omite `passwordHash`
por defecto en todas las consultas). Prisma está fijado en **6.19.3**.

**Cliente de Prisma por servicio:** cada `schema.prisma` declara
`output = "../generated/prisma-client"` y el código importa desde
`../generated/prisma-client/index.js`, **nunca desde `@prisma/client`**. Con npm workspaces,
`@prisma/client` apunta a un único cliente compartido en la raíz y los servicios se pisarían los
modelos entre sí. `generated/` está en `.gitignore` y se regenera con `npm install`
(`postinstall: prisma generate`). Los enums de Prisma (`ChallengeType`, `Prisma.SortOrder`) se
importan del mismo lugar.

Las rutas públicas de un servicio usan `requireUser` (vienen del gateway); las `/internal/*`,
`requireInternalToken`. Ejemplo completo de los dos tipos: `services/content-service/src/routes/`.

### Estado

auth-service, api-gateway y content-service (DEV-02: lectura de zonas, niveles, teoría y los
endpoints internos para gameplay) están implementados; gameplay, progress y rewards son
esqueletos con solo `/health`. `apps/web` (React + Vite + Tailwind) todavía no existe aunque ya
está en los workspaces y en la config de ESLint. `Dev-venture/` es un repo git aparte (backlog y
script de Trello), no forma parte del monorepo.

## Configuración de Claude en `.claude/`

- `agents/`: `code-reviewer`, `security-auditor`, `test-engineer`, `web-performance-auditor`.
- `commands/`: `/spec` → `/plan` → `/build` → `/test` → `/review` → `/ship` (además
  `/code-simplify`, `/constraints`, `/webperf`).
- `skills/`: agent-skills (TDD, spec-driven, incremental, security, API design, ADRs, etc.) y los
  guards `clean-code-guard`, `test-guard`, `docs-guard`. Son de terceros: no se formatean con
  Prettier (están en `.prettierignore`).
- Para docs de Express 5, Prisma 6, Zod, Vitest, etc. usar el MCP de context7 en vez de memoria.
