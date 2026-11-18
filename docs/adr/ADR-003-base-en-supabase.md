# ADR-003 · Base de datos de producción en Supabase

- **Estado:** aceptado
- **Fecha:** 2026-11-18
- **Modifica:** ADR-001 (fila "Base de datos": "una base por servicio")

## Contexto

En local cada servicio tiene su propia base dentro del Postgres de Docker (`infra/postgres/init.sql`).
Para el deploy se quiere un Postgres administrado, sin mantener un servidor de base propio. Un
proyecto de Supabase trae una sola base (`postgres`) y Supabase recomienda separar con esquemas.

## Decisión

- En producción, un solo proyecto de Supabase con **un esquema por servicio**: `auth`, `content`,
  `gameplay`, `progress`, `rewards` y `assistant`. Cada servicio elige el suyo con `?schema=` en
  su `DATABASE_URL`.
- Los servicios se conectan por el **session pooler (puerto 5432)**, no por el transaction pooler
  (6543). Los servicios son procesos que quedan corriendo, y las consultas `$queryRaw` y las
  funciones de gameplay (`normalize_code`, `escape_regex`, `normalize_output`) usan nombres sin
  esquema: dependen del `search_path` de la sesión, que en transaction mode no se mantiene.
- Con session mode no hace falta `directUrl` ni `pgbouncer=true`: los `schema.prisma` no cambian.
- En local se sigue usando el Postgres de Docker con una base por servicio.

## Consecuencias

- La separación entre servicios se mantiene: cada uno solo ve las tablas de su esquema y no hay
  foreign keys entre esquemas.
- Las tablas quedan fuera del esquema `public`, que es el que Supabase expone en su Data API: el
  front nunca habla con Supabase, solo con el gateway.
- Seis servicios comparten el límite de conexiones del pooler del plan: cada `DATABASE_URL` lleva
  `connection_limit` bajo.
- El plan gratuito pausa el proyecto tras una semana sin actividad.
- Pasos de deploy en `docs/deploy-supabase.md`.
