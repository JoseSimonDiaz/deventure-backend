# Reglas de código (aprendidas de code review)

Reglas concretas que salen de las revisiones de PR. Complementan `CLAUDE.md` y el ADR-001.
Cada regla nueva indica de qué observación salió (ver `.claude/reviews/<TICKET>.md`).

Cuando llega una review: anotar cada comentario en `.claude/reviews/DEV-XX.md` (estado ⏳/✅) y,
si deja una lección general, agregarla acá con su origen `_(DEV-XX #n)_`.

## Configuración y variables de entorno

- No agregar variables de entorno que el ticket no pida. Antes de crear una, buscar si ya existe
  (`grep -rn "process.env\|loadConfig" services packages`, `.env.example`).
- Toda variable nueva va en el esquema Zod de `src/config.js` del servicio (con `loadConfig`) y en
  el `.env.example` correspondiente. Nunca leer `process.env.X` suelto en la lógica.
- No encadenar fallbacks entre variables (`A || B`). Una responsabilidad = una variable.

## Capas y responsabilidades

- `routes → controllers → services → repositories (Prisma) → mappers`. Los controllers solo
  traducen HTTP ↔ service; solo los repositories tocan `prisma`.
- La validación de entrada vive en `validate({ body, params, query })` con esquemas de
  `@deventure/contracts`, no en los services.
- Los servicios no validan JWT: confían en `requireUser` (headers del gateway).
- Nada de foreign keys ni consultas a la base de otro servicio: se llama a su `/internal/*`.

## Manejo de errores

- No tragarse errores. Un `try/catch` que solo loguea y sigue esconde la falla. Lanzar subclases
  de `AppError` de `@deventure/service-kit` y dejar que el `errorHandler` responda.
- Si se decide continuar a pesar de un error, hacerlo explícito en el service con
  `logger.error` incluyendo el contexto (ids, usuario, correlationId).
- Usar el logger (`req.log` / `app.locals.logger`), no `console.log`.

## Alcance del cambio

- Al resolver un comentario de review, tocar solo lo que ese comentario señala.
- Antes de cerrar, `git diff main -- <archivo>` y confirmar que el diff es el mínimo necesario.
- No modificar código ajeno al ticket para "unificar" salvo que el ticket lo pida.

## Proceso

- Antes de afirmar cómo se comporta una librería o API externa, verificarlo (context7, docs
  oficiales o una prueba) y citar la fuente.
