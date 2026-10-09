# Dev-venture · Deventure

Juego web educativo de programación con estética vikinga (tesis).
Monorepo con **microservicios Express que se comunican solo por REST**, PostgreSQL (una base por
servicio, Prisma 6.19.3) y frontend React + Tailwind. Decisiones en
[docs/adr/ADR-001](docs/adr/ADR-001-stack-y-arquitectura.md).

```
Dev-venture/
├── apps/web/                 ← frontend React (próximamente)
├── services/
│   ├── api-gateway/          ← 3000 · única entrada pública (/api/*), JWT, CORS, rate limit
│   ├── auth-service/         ← 3001 · auth_db · registro, login, /me
│   ├── content-service/      ← 3002 · content_db   (esqueleto: solo /health)
│   ├── gameplay-service/     ← 3003 · gameplay_db  (esqueleto)
│   ├── progress-service/     ← 3004 · progress_db  (esqueleto)
│   └── rewards-service/      ← 3005 · rewards_db   (esqueleto)
├── packages/
│   ├── service-kit/          ← Express base, errores, logger, validate, health
│   ├── contracts/            ← esquemas Zod compartidos (front + back)
│   └── eslint-config/
├── infra/                    ← docker-compose.yml + init.sql
└── docs/                     ← ADRs y ejemplos de la API (docs/api/*.http)
```

## Requisitos

- **Node 22** (`nvm use` o instalador de nodejs.org) · **Git** · **Docker Desktop**

## Primeros pasos (Windows / Mac / Linux)

```bash
git clone https://github.com/JoseSimonDiaz/Dev-venture.git
cd Dev-venture
npm install

# 1) Variables de entorno (en Windows CMD usar `copy` en lugar de `cp`)
cp .env.example .env
cp services/api-gateway/.env.example services/api-gateway/.env
cp services/auth-service/.env.example services/auth-service/.env

# 2) PostgreSQL en Docker (crea auth_db, content_db, gameplay_db, progress_db, rewards_db)
npm run db:up

# 3) Tablas + usuarios de prueba
npm run db:deploy -w @deventure/auth-service
npm run db:seed -w @deventure/auth-service

# 4) Levantar todos los servicios con recarga automática
npm run dev
```

Probar: abrir [docs/api/auth.http](docs/api/auth.http) con la extensión **REST Client** de VS Code,
o:

```bash
curl -X POST http://localhost:3000/api/auth/login -H "Content-Type: application/json" -d "{\"identifier\":\"demo\",\"password\":\"Demo1234\"}"
```

Usuarios del seed: `admin` / `Admin1234` (rol admin) y `demo` / `Demo1234` (jugador).

### Todo en Docker (sin Node local)

```bash
cp .env.example .env
npm run dev:all     # build + up de postgres, gateway y los 5 servicios
npm run down        # apagar
```

## Scripts

| Comando                                                            | Qué hace                                                          |
| ------------------------------------------------------------------ | ----------------------------------------------------------------- |
| `npm run dev`                                                      | Levanta gateway + 5 servicios en tu máquina (recargan al guardar) |
| `npm run db:up` / `npm run db:reset`                               | Postgres en Docker / borrar y recrear las bases                   |
| `npm run dev:all` / `npm run down`                                 | Todo el backend en Docker                                         |
| `npm test`                                                         | Tests de todos los workspaces (auth usa la base `auth_db_test`)   |
| `npm test -w @deventure/auth-service`                              | Tests de un solo workspace                                        |
| `npm run lint` / `npm run format`                                  | ESLint / Prettier                                                 |
| `npm run db:migrate -w @deventure/auth-service -- --name <nombre>` | Nueva migración de Prisma                                         |
| `npm run db:studio -w @deventure/auth-service`                     | Ver la base en el navegador                                       |

## API (por el gateway, `http://localhost:3000`)

| Método y ruta                                             | Auth   | Respuesta                                                                          |
| --------------------------------------------------------- | ------ | ---------------------------------------------------------------------------------- |
| `GET /health`                                             | —      | `200 { data: { status: 'ok', ... } }`                                              |
| `POST /api/auth/register` `{ username, email, password }` | —      | `201 { data: { token, user } }` · 400 · 409 `USERNAME_TAKEN` / `EMAIL_TAKEN`       |
| `POST /api/auth/login` `{ identifier, password }`         | —      | `200 { data: { token, user } }` · 401 `INVALID_CREDENTIALS` · 423 `ACCOUNT_LOCKED` |
| `GET /api/auth/me`                                        | Bearer | `200 { data: user }` · 401                                                         |

Errores siempre con la forma `{ "error": { "code", "message", "details"? } }`.
`/api/{content,gameplay,progress,rewards}/*` se reenvían a cada servicio; `/api/admin/<servicio>/*`
exige rol admin; cualquier ruta con `/internal` responde 404 desde afuera.

## Cómo trabajamos

Ramas `feature/DEV-XX-descripcion`, commits `tipo(alcance): descripción` (commitlint los valida),
PR a `main` con 1 aprobación + CI verde, "Squash and merge". Ver la tarjeta de Recursos en Trello.
