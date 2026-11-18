# Dev-venture · Deventure

Juego web educativo de programación con estética vikinga (tesis).
Monorepo con **microservicios Express que se comunican solo por REST**, PostgreSQL (una base por
servicio, Prisma 6.19.3) y frontend React + Tailwind. Decisiones en
[docs/adr/ADR-001](docs/adr/ADR-001-stack-y-arquitectura.md); reglas de negocio en
[docs/analisis-funcional.md](docs/analisis-funcional.md).

```
Dev-venture/
├── services/
│   ├── api-gateway/          ← 3000 · única entrada pública (/api/*), JWT, CORS, rate limit, stats de admin
│   ├── auth-service/         ← 3001 · auth_db · cuenta, login, ajustes, avatar, borrado en todos los servicios
│   ├── content-service/      ← 3002 · content_db · zonas, niveles, desafíos, pistas, teoría, panel admin
│   ├── gameplay-service/     ← 3003 · gameplay_db · sesiones, 5 validadores, vidas, estrellas, pistas, anti-trampas
│   ├── progress-service/     ← 3004 · progress_db · progreso, desbloqueos, teoría vista, resumen y racha
│   ├── rewards-service/      ← 3005 · rewards_db · recompensas por reglas y galería
│   └── assistant-service/    ← 3006 · assistant_db · asistente IA (sin API key responde con pistas)
├── packages/
│   ├── service-kit/          ← Express base, errores, logger, validate, cliente interno, job de reintentos
│   ├── contracts/            ← esquemas Zod compartidos (front + back)
│   └── eslint-config/
├── infra/                    ← docker-compose.yml + postgres/init.sql
└── docs/                     ← ADRs y ejemplos de la API (docs/api/*.http)
```

El frontend (React + Vite + TypeScript) vive en el repo `deventure-front` y consume este backend
por el gateway (`VITE_API_URL=http://localhost:3000`).

## Requisitos

| Herramienta           | Versión | Para qué                                             |
| --------------------- | ------- | ---------------------------------------------------- |
| **Node.js**           | ≥ 22.9  | Correr los servicios (`node -v` para verificar)      |
| **Git**               | —       | Clonar el repo                                       |
| **Docker Desktop**    | —       | PostgreSQL 16 (y opcionalmente todo el backend)      |
| VS Code + REST Client | —       | Opcional: ejecutar los ejemplos de `docs/api/*.http` |

> Docker Desktop tiene que estar **abierto y con el engine corriendo** antes de cualquier
> `npm run db:*`. Si no, los servicios fallan con `Can't reach database server`.

## Instalación (una sola vez)

### 1. Clonar e instalar dependencias

```bash
git clone https://github.com/JoseSimonDiaz/Dev-venture.git
cd Dev-venture
npm install          # también genera el cliente de Prisma de cada servicio
```

### 2. Variables de entorno

Hay un `.env` en la raíz (lo usa Docker Compose) y uno por servicio (lo usa `npm run dev`).

**Bash (Mac / Linux / Git Bash):**

```bash
cp .env.example .env
for service in api-gateway auth-service content-service gameplay-service progress-service rewards-service assistant-service; do
  cp services/$service/.env.example services/$service/.env
done
```

**PowerShell (Windows):**

```powershell
Copy-Item .env.example .env
'api-gateway','auth-service','content-service','gameplay-service','progress-service','rewards-service','assistant-service' |
  ForEach-Object { Copy-Item "services/$_/.env.example" "services/$_/.env" }
```

Después completar los valores. Reglas que tienen que coincidir entre archivos:

- `JWT_SECRET`: **el mismo** en la raíz, `api-gateway` y `auth-service` (mínimo 32 caracteres).
- `INTERNAL_TOKEN`: **el mismo** en la raíz y en todos los servicios.
- Usuario, contraseña y puerto de Postgres: los de la raíz tienen que coincidir con el
  `DATABASE_URL` de cada servicio.

**`.env` (raíz):**

```dotenv
POSTGRES_USER=deventure
POSTGRES_PASSWORD=deventure
POSTGRES_PORT=5432        # 5433 si ya tenés un Postgres local en 5432
JWT_SECRET=un-secreto-de-al-menos-32-caracteres-para-jwt
INTERNAL_TOKEN=cambiar-por-otro-secreto-interno
AI_API_KEY=               # opcional
```

Los `.env.example` solo traen los nombres de las variables; estos son los valores de desarrollo
local (las URLs y puertos que se omitan toman su valor por defecto, pero no
dejar claves con `=` vacío):

**`services/api-gateway/.env`:**

```dotenv
NODE_ENV=development
PORT=3000
JWT_SECRET=un-secreto-de-al-menos-32-caracteres-para-jwt
INTERNAL_TOKEN=cambiar-por-otro-secreto-interno
CORS_ORIGIN=http://localhost:5173
AUTH_URL=http://localhost:3001
CONTENT_URL=http://localhost:3002
GAMEPLAY_URL=http://localhost:3003
PROGRESS_URL=http://localhost:3004
REWARDS_URL=http://localhost:3005
ASSISTANT_URL=http://localhost:3006
RATE_LIMIT_AUTH_MAX=10
RATE_LIMIT_GLOBAL_MAX=300
```

**`services/auth-service/.env`:**

```dotenv
NODE_ENV=development
PORT=3001
DATABASE_URL="postgresql://deventure:deventure@localhost:5432/auth_db?schema=public"
JWT_SECRET=un-secreto-de-al-menos-32-caracteres-para-jwt
JWT_EXPIRES_IN=24h
INTERNAL_TOKEN=cambiar-por-otro-secreto-interno
SEED_ADMIN_PASSWORD=Admin1234
SEED_DEMO_PASSWORD=Demo1234
GAMEPLAY_URL=http://localhost:3003
PROGRESS_URL=http://localhost:3004
REWARDS_URL=http://localhost:3005
ASSISTANT_URL=http://localhost:3006
```

**`services/rewards-service/.env`:**

```dotenv
NODE_ENV=development
PORT=3005
DATABASE_URL="postgresql://deventure:deventure@localhost:5432/rewards_db?schema=public"
INTERNAL_TOKEN=cambiar-por-otro-secreto-interno
CONTENT_URL=http://localhost:3002
PROGRESS_URL=http://localhost:3004
```

**`services/content-service/.env`:**

```dotenv
NODE_ENV=development
PORT=3002
DATABASE_URL="postgresql://deventure:deventure@localhost:5432/content_db?schema=public"
INTERNAL_TOKEN=cambiar-por-otro-secreto-interno
GAMEPLAY_URL=http://localhost:3003
```

**`services/gameplay-service/.env`:**

```dotenv
NODE_ENV=development
PORT=3003
DATABASE_URL="postgresql://deventure:deventure@localhost:5432/gameplay_db?schema=public"
INTERNAL_TOKEN=cambiar-por-otro-secreto-interno
CONTENT_URL=http://localhost:3002
PROGRESS_URL=http://localhost:3004
REWARDS_URL=http://localhost:3005
```

**`services/progress-service/.env`:**

```dotenv
NODE_ENV=development
PORT=3004
DATABASE_URL="postgresql://deventure:deventure@localhost:5432/progress_db?schema=public"
INTERNAL_TOKEN=cambiar-por-otro-secreto-interno
CONTENT_URL=http://localhost:3002
```

**`services/assistant-service/.env`:**

```dotenv
NODE_ENV=development
PORT=3006
DATABASE_URL="postgresql://deventure:deventure@localhost:5432/assistant_db?schema=public"
INTERNAL_TOKEN=cambiar-por-otro-secreto-interno
CONTENT_URL=http://localhost:3002
GAMEPLAY_URL=http://localhost:3003
AI_API_KEY=               # opcional: sin ella el asistente responde con pistas
AI_MODEL=qwen/qwen3.8-27b
AI_TIMEOUT_MS=5000
```

Si cambiaste `POSTGRES_PORT`, usar ese puerto en cada `DATABASE_URL`.

### 3. Levantar PostgreSQL

```bash
npm run db:up
```

La primera vez crea las 6 bases (`auth_db`, `content_db`, `gameplay_db`, `progress_db`,
`rewards_db`, `assistant_db`) con [infra/postgres/init.sql](infra/postgres/init.sql).

### 4. Crear tablas y cargar datos de prueba

**Bash:**

```bash
for service in auth-service content-service gameplay-service progress-service rewards-service assistant-service; do
  npm run db:deploy -w @deventure/$service
done
```

**PowerShell:**

```powershell
'auth-service','content-service','gameplay-service','progress-service','rewards-service','assistant-service' |
  ForEach-Object { npm run db:deploy -w "@deventure/$_" }
```

Y los seeds (iguales en los dos shells, en este orden):

```bash
npm run db:seed -w @deventure/auth-service
npm run db:seed -w @deventure/content-service
npm run db:seed -w @deventure/progress-service
npm run db:seed -w @deventure/rewards-service
```

Quedan cargados usuarios, 4 zonas con 24 niveles y las recompensas.

## Levantar el servidor

### Primera vez

Con los pasos de instalación hechos:

```bash
npm run dev
```

Levanta el gateway y los 6 servicios en paralelo con recarga automática al guardar. Cada línea
del log lleva el prefijo del servicio (`[gateway]`, `[auth]`, …). `Ctrl + C` los apaga a todos.

### Días siguientes

1. Abrir **Docker Desktop** y esperar a que el engine esté corriendo.
2. `npm run db:up` (Postgres no se levanta solo al prender la máquina).
3. `npm run dev`.

Si hiciste `git pull` y llegaron migraciones o dependencias nuevas, antes del paso 3 corré
`npm install` y el paso 4 de la instalación (`db:deploy`).

### Verificar que funciona

```bash
curl http://localhost:3000/health
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"identifier\":\"demo\",\"password\":\"Demo1234\"}"
```

El login devuelve `{ "data": { "token": ..., ... } }`. Cada servicio también expone
`GET /health` en su puerto (`http://localhost:3001/health`, etc.).

Usuarios del seed:

| Usuario   | Contraseña  | Para qué                                            |
| --------- | ----------- | --------------------------------------------------- |
| `admin`   | `Admin1234` | Rol admin: panel de contenido y estadísticas        |
| `demo`    | `Demo1234`  | Jugador nuevo                                       |
| `campeon` | `Demo1234`  | Jugador con todo el juego completo (pantalla final) |

### Conectar el frontend

En el repo `deventure-front`, con `VITE_API_URL=http://localhost:3000`, correr `npm run dev`
(Vite en `http://localhost:5173`, que es el origen permitido por `CORS_ORIGIN` del gateway).

### Todo en Docker (sin Node local)

```bash
npm run dev:all     # build + up de postgres, jaeger, gateway y los 6 servicios
npm run down        # apagar
```

Solo necesita el `.env` de la raíz: las migraciones y seeds corren al arrancar cada contenedor.
En este modo cada servicio exporta trazas de OpenTelemetry a Jaeger: abrí
`http://localhost:16686`, elegí `api-gateway` y vas a ver cada request recorriendo gateway →
gameplay → progress → rewards en una sola traza.

## Uso de la API

Todas las rutas van por el gateway (`http://localhost:3000`) con prefijo `/api`:

1. `POST /api/auth/register` o `POST /api/auth/login` → devuelve un `token`.
2. El resto de las rutas lleva `Authorization: Bearer <token>`.

Ejemplos listos para ejecutar en [docs/api](docs/api) (`auth`, `content`, `gameplay`,
`progress-rewards`, `admin`): abrirlos en VS Code con la extensión **REST Client** y hacer clic en
"Send Request".

| Servicio  | Endpoints                                                                                                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| auth      | `POST /auth/register` · `POST /auth/login` · `GET/PATCH/DELETE /auth/me` · `PATCH /auth/me/intro-seen` · `GET/PATCH /auth/me/settings` · `PATCH /auth/me/password` · `PATCH /auth/me/avatar` |
| content   | `GET /content/zones` · `GET /content/levels/:levelId` (sin solución) · `GET /content/zones/:zoneId/theory`                                                                                   |
| gameplay  | `POST /gameplay/sessions` · `GET/PATCH /gameplay/sessions/:id` · `POST /gameplay/sessions/:id/attempts` · `POST /gameplay/sessions/:id/hints`                                                |
| progress  | `GET /progress/me` · `GET /progress/me/summary` · `GET/POST /progress/me/theory-seen`                                                                                                        |
| rewards   | `GET /rewards/me?type=&status=` · `PATCH /rewards/me/:rewardId/seen`                                                                                                                         |
| assistant | `POST /assistant/hints`                                                                                                                                                                      |
| admin     | `/admin/content/*` (CRUD, orden, archivo, `challenge-previews`) · `GET /admin/stats` · `GET /admin/gameplay/pending-calls`                                                                   |

Respuestas OK con la forma `{ "data": ... }` y errores con
`{ "error": { "code", "message", "details"? } }`. Cualquier ruta con `/internal` responde 404
desde afuera; `/api/admin/*` exige rol admin.

### Asistente IA

`assistant-service` usa la API de Groq si `AI_API_KEY` está configurada (modelo `AI_MODEL`,
timeout `AI_TIMEOUT_MS`). Sin key, o si la IA tarda más de 5 s o falla, responde con la pista
siguiente del desafío. Máximo 10 consultas por jugador y nivel.

## Scripts

| Comando                                                          | Qué hace                                                          |
| ---------------------------------------------------------------- | ----------------------------------------------------------------- |
| `npm run dev`                                                    | Levanta gateway + 6 servicios en tu máquina (recargan al guardar) |
| `npm run db:up` / `npm run db:reset`                             | Postgres en Docker / borrar y recrear las bases (¡borra datos!)   |
| `npm run dev:all` / `npm run down`                               | Todo el backend en Docker                                         |
| `npm run db:deploy -w @deventure/<servicio>`                     | Aplicar migraciones pendientes de un servicio                     |
| `npm run db:seed -w @deventure/<servicio>`                       | Cargar datos de prueba de un servicio                             |
| `npm run db:migrate -w @deventure/<servicio> -- --name <nombre>` | Nueva migración de Prisma                                         |
| `npm run db:studio -w @deventure/<servicio>`                     | Ver la base en el navegador                                       |
| `npm test`                                                       | Tests de todos los workspaces (auth usa la base `auth_db_test`)   |
| `npm test -w @deventure/auth-service`                            | Tests de un solo workspace                                        |
| `npm run lint` / `npm run format`                                | ESLint / Prettier                                                 |

## Problemas comunes

| Síntoma                                                    | Causa y solución                                                                                                                                            |
| ---------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `Can't reach database server at localhost:5432` (o `5433`) | Postgres no está corriendo. Abrir Docker Desktop y `npm run db:up`. Si el puerto no coincide, revisar `POSTGRES_PORT` y el `DATABASE_URL` de cada servicio. |
| `error during connect ... dockerDesktopLinuxEngine`        | Docker Desktop está cerrado. Abrirlo y esperar a que el engine esté corriendo.                                                                              |
| Un servicio no arranca y lista variables inválidas         | Falta un valor en su `.env` o quedó una clave vacía (`PORT=`). Completar según la sección de variables de entorno.                                          |
| `The table ... does not exist`                             | Faltan migraciones: correr el paso 4 de la instalación (`db:deploy`).                                                                                       |
| Login devuelve 401 con usuarios del seed                   | No se corrieron los seeds, o `JWT_SECRET` difiere entre gateway y auth.                                                                                     |
| Error de CORS en el navegador                              | El origen del front no está en `CORS_ORIGIN` del gateway (lista separada por comas).                                                                        |
| `EPERM` al hacer `npm install` en Windows                  | Hay un `npm run dev` corriendo que bloquea el motor de Prisma. Cortarlo con `Ctrl + C` y repetir.                                                           |
| `EADDRINUSE: address already in use :::300X`               | Quedó otro proceso en ese puerto (otro `npm run dev` o `npm run dev:all`). Cerrarlo o `npm run down`.                                                       |
| Los ids del contenido no coinciden con los del front       | Bases creadas con un seed viejo: `npm run db:reset` y repetir los pasos 4 de la instalación.                                                                |

## Cómo trabajamos

Ramas `feature/DEV-XX-descripcion`, commits `tipo(alcance): descripción` (commitlint los valida),
PR a `main` con 1 aprobación + CI verde, "Squash and merge". Antes de abrir el PR:
`npm run lint` y `npm run format:check`. Ver la tarjeta de Recursos en Trello.
