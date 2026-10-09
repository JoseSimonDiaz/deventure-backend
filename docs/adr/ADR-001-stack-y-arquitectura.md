# ADR-001 · Stack y arquitectura

- **Estado:** aceptado
- **Fecha:** 2026-10-09

## Contexto

Deventure es un juego web educativo (tesis) desarrollado por un equipo de 4 personas en paralelo.
Se busca un proyecto profesional, modular y fácil de explicar en la defensa.

## Decisión

| Tema              | Decisión                                                                                                                                |
| ----------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| Lenguaje          | JavaScript (ESM, Node 22). Sin TypeScript; tipos documentados con JSDoc + Zod                                                           |
| Frontend          | React + Vite + Tailwind (`apps/web`)                                                                                                    |
| Backend           | Express 5, un proceso por microservicio (`services/*`)                                                                                  |
| Base de datos     | PostgreSQL 16, **una base por servicio**, Prisma 6.19.3                                                                                 |
| Comunicación      | **Solo REST**. Público: `/api/*` por el api-gateway. Entre servicios: `/internal/*` con header `x-internal-token`. Sin colas ni eventos |
| Entrada única     | `api-gateway` (puerto 3000): valida el JWT, aplica rate limit/CORS y reenvía con `x-user-id` / `x-user-role` / `x-correlation-id`       |
| Código compartido | `packages/service-kit` (Express base, errores, logs) y `packages/contracts` (esquemas Zod)                                              |
| Monorepo          | npm workspaces                                                                                                                          |
| Calidad           | ESLint + Prettier + Husky + commitlint, Vitest + Supertest, CI en GitHub Actions                                                        |

| Servicio         | Puerto | Base        |
| ---------------- | ------ | ----------- |
| api-gateway      | 3000   | —           |
| auth-service     | 3001   | auth_db     |
| content-service  | 3002   | content_db  |
| gameplay-service | 3003   | gameplay_db |
| progress-service | 3004   | progress_db |
| rewards-service  | 3005   | rewards_db  |

## Consecuencias

- Cada servicio se puede desarrollar, testear y desplegar por separado.
- No hay foreign keys entre servicios: los ids de otro servicio se guardan como `uuid` sin relación.
- Las llamadas internas pueden fallar: se resuelven con reintentos, idempotencia por `sessionId` y
  la tabla `pending_internal_calls` (DEV-44).
- Más piezas para levantar en local: se simplifica con Docker Compose (`npm run dev:all`).
