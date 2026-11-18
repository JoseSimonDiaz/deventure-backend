# Deploy: backend en Render, front en Netlify, base en Supabase

| Parte                 | Dónde    | Configuración                                            |
| --------------------- | -------- | -------------------------------------------------------- |
| Base                  | Supabase | `docs/deploy-supabase.md` (un esquema por servicio)      |
| Backend (7 servicios) | Render   | `render.yaml` en la raíz del repo (Blueprint, plan Free) |
| Front                 | Netlify  | repo `deventure-front`                                   |

## Limitaciones del plan Free de Render

Según `render.com/docs/free`:

- Un servicio Free se apaga tras 15 minutos sin tráfico y tarda ~1 minuto en volver. Como el
  gateway llama a otros servicios, el primer request después de un rato puede tardar varios
  minutos. Antes de una demo, abrir el juego unos minutos antes para despertarlos.
- Mientras un servicio está apagado no corren sus jobs (reintento de llamadas internas, vencimiento
  de sesiones): se ponen al día al despertar.
- Los servicios Free no reciben tráfico de la red privada, así que los 7 son públicos en
  `https://<nombre>.onrender.com`. Los servicios internos solo aceptan requests con el
  `INTERNAL_TOKEN`: `requireUser` lo exige junto con los headers de identidad que pone el gateway.
- 750 horas Free por mes para todo el workspace, compartidas entre los 7 servicios (los servicios
  apagados no consumen).

## 1. Base en Supabase

Seguir `docs/deploy-supabase.md`. Crear el proyecto en la región **East US (North Virginia)**, la
misma que usa `render.yaml` (`region: virginia`), y tener a mano la URL del session pooler.

## 2. Backend en Render

1. En el dashboard de Render: **New → Blueprint**, elegir el repo `deventure-backend` y la rama a
   deployar. Render lee `render.yaml` y muestra los 7 servicios.
2. Completar las variables que pide (las marcadas `sync: false`):

   | Servicio            | Variable              | Valor                                                         |
   | ------------------- | --------------------- | ------------------------------------------------------------- |
   | deventure-gateway   | `CORS_ORIGIN`         | `https://<tu-sitio>.netlify.app` (varias, separadas por coma) |
   | deventure-auth      | `DATABASE_URL`        | `…/postgres?schema=auth&connection_limit=3`                   |
   | deventure-auth      | `SEED_ADMIN_PASSWORD` | contraseña fuerte (el seed la reescribe en cada arranque)     |
   | deventure-auth      | `SEED_DEMO_PASSWORD`  | contraseña fuerte                                             |
   | deventure-content   | `DATABASE_URL`        | `…/postgres?schema=content&connection_limit=3`                |
   | deventure-gameplay  | `DATABASE_URL`        | `…/postgres?schema=gameplay&connection_limit=3`               |
   | deventure-progress  | `DATABASE_URL`        | `…/postgres?schema=progress&connection_limit=3`               |
   | deventure-rewards   | `DATABASE_URL`        | `…/postgres?schema=rewards&connection_limit=3`                |
   | deventure-assistant | `DATABASE_URL`        | `…/postgres?schema=assistant&connection_limit=3`              |
   | deventure-assistant | `AI_API_KEY`          | API key de Groq (opcional: sin ella responde con las pistas)  |

   `…` es la URL del session pooler de Supabase hasta `/postgres`.

3. Lo demás lo resuelve el Blueprint:
   - `INTERNAL_TOKEN` y `JWT_SECRET` se generan una sola vez en los grupos `deventure-shared` y
     `deventure-jwt`, y todos los servicios leen el mismo valor.
   - Las `*_URL` entre servicios toman la `RENDER_EXTERNAL_URL` de cada servicio.
   - `SERVICE` le dice al Dockerfile único (`infra/service.Dockerfile`) qué servicio construir:
     Render pasa las variables como build args.
   - `PORT` lo pone Render.
   - Las migraciones y los seeds corren solos en cada arranque (`start:docker`).

4. Cuando terminen los deploys, revisar en el **Environment** de `deventure-gateway` que las seis
   `*_URL` tengan un valor `https://…onrender.com`. Si alguna quedó vacía (el servicio al que
   apunta todavía no existía cuando se creó), ir al Blueprint y hacer **Manual Sync**, o cargar la
   URL a mano desde el dashboard de ese servicio.

5. Probar: `https://deventure-gateway.onrender.com/health` responde `{"data":{"status":"ok",…}}`.
   Si Render tuvo que cambiar el nombre porque `deventure-gateway` ya estaba tomado, la URL real
   está en el dashboard del servicio.

Cada push a la rama elegida vuelve a deployar solo los servicios cuyos archivos cambiaron
(`buildFilter` de cada servicio en `render.yaml`).

## 3. Front en Netlify

En Netlify: **Add new site → Import from Git**, elegir `deventure-front`.

- **Build command:** `pnpm build`
- **Publish directory:** `dist`
- **Variable:** `VITE_API_URL=https://deventure-gateway.onrender.com` (sin `/` al final). Vite la
  mete en el build: si cambia, hay que volver a deployar.

`public/_redirects` hace que las rutas del front (`/zones`, `/level/...`) carguen `index.html` al
recargar la página.

Después de crear el sitio, volver a Render y poner la URL de Netlify en `CORS_ORIGIN` del gateway.
