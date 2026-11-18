# Deploy de la base en Supabase

Decisión y motivos en `docs/adr/ADR-003-base-en-supabase.md`. Esta guía sirve para cualquier
hosting que corra los servicios con `infra/service.Dockerfile`.

## 1. Crear el proyecto

1. En [supabase.com](https://supabase.com) crear un proyecto. Guardar la contraseña de la base en
   un gestor de contraseñas: no va en el repo.
2. Elegir la región más cercana a donde corran los servicios (cada consulta cruza esa distancia).

## 2. Armar las URLs de conexión

En el dashboard: **Connect → Session pooler**. La URL tiene esta forma:

```
postgresql://postgres.<project-ref>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
```

Cada servicio usa esa misma URL con su esquema y un límite de conexiones:

| Servicio          | `DATABASE_URL` (sufijo)                          |
| ----------------- | ------------------------------------------------ |
| auth-service      | `…/postgres?schema=auth&connection_limit=3`      |
| content-service   | `…/postgres?schema=content&connection_limit=3`   |
| gameplay-service  | `…/postgres?schema=gameplay&connection_limit=3`  |
| progress-service  | `…/postgres?schema=progress&connection_limit=3`  |
| rewards-service   | `…/postgres?schema=rewards&connection_limit=3`   |
| assistant-service | `…/postgres?schema=assistant&connection_limit=3` |

- Usar el **session pooler (5432)**, no el transaction pooler (6543): ver ADR-003.
- Si la contraseña tiene caracteres especiales (`@`, `#`, `/`, `:`), van codificados
  (`encodeURIComponent`).
- 6 servicios × 3 = 18 conexiones. Si el plan tiene un límite menor en el pooler, bajar
  `connection_limit` a 2.

Las URLs se cargan como variables de entorno (secretos) en el hosting de cada servicio, junto con
el resto de su `.env.example`.

## 3. Migraciones y seeds

No hay pasos manuales: el `start:docker` de cada servicio corre `prisma migrate deploy` (crea el
esquema, las tablas y las funciones) y, en auth, content, progress y rewards, `prisma db seed`. Los
seeds usan upsert, así que se pueden correr en cada arranque.

Para aplicarlas a mano desde una máquina local (por ejemplo, antes del primer deploy):

```bash
DATABASE_URL="<url del servicio>" npm run db:deploy -w @deventure/<servicio>
DATABASE_URL="<url del servicio>" npm run db:seed -w @deventure/<servicio>
```

## 4. Antes y después del primer deploy

- **Contraseñas de los usuarios del seed.** El seed de auth corre en cada arranque y vuelve a
  escribir la contraseña de `admin`, `demo` y `campeon`: cambiarla desde "Mi cuenta" no dura. Sin
  variables quedan `Admin1234` y `Demo1234`, así que en el hosting de auth-service hay que cargar
  `SEED_ADMIN_PASSWORD` y `SEED_DEMO_PASSWORD` como secretos, con contraseñas fuertes.
- Verificar en **Table Editor** que aparezcan los seis esquemas con sus tablas.
- El plan gratuito pausa el proyecto tras una semana sin actividad: antes de una demo o de la
  defensa, entrar al dashboard unos días antes y reactivarlo si hace falta.
