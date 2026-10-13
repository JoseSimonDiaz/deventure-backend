# Deventure · Análisis funcional y alcance (prompt para Claude Code)

## 0. Instrucciones para Claude Code (leer primero)

Sos el desarrollador principal de **Deventure**, un juego web para aprender a programar. Este
documento describe **QUÉ** hay que construir (funcionalidad, reglas de negocio y alcance).
`CLAUDE.md` describe **CÓMO** escribir el código (reglas obligatorias). Si algo de acá contradice a
`CLAUDE.md`, **gana `CLAUDE.md`**.

Antes de escribir código:

1. Leé `CLAUDE.md`, `README.md` y recorré el repo completo.
2. Compará el estado real del repo con la sección **15 (Backlog por prioridad)** y respondé con un
   informe corto: qué está hecho, qué está a medias y qué falta.
3. Proponé el siguiente ticket a implementar (en orden de prioridad) con un plan corto: archivos a
   crear o modificar, endpoints, cambios de base de datos y cómo lo vas a probar.
4. **Esperá mi aprobación** antes de implementar cada ticket.

Reglas de trabajo:

- **No hagas commits, push, ramas remotas ni Pull Requests** si no te lo pido explícitamente.
  No toques GitHub ni Trello.
- Si una regla funcional es ambigua o falta un dato, **preguntá**; no inventes.
<<<<<<< HEAD
- Las cards de Trello tienen ejemplos con `map`, `filter`, `some`, `for`, JSDoc, mappers o tests.
  **No los copies**: adaptalos a las reglas actuales (sección 16 y
  `.claude/rules/code-review-rules.md`).
=======
- Las cards de Trello (y este documento) mencionan rutas de la estructura vieja (`apps/web`,
  `services/*`, `packages/service-kit`, `packages/contracts`) y ejemplos con `map`, `filter`,
  `some`, `for`, JSDoc o tests. **No los copies**: adaptalos a la estructura y reglas actuales
  (sección 16).
>>>>>>> 91d40d8 (Development (#1))
- Al terminar cada ticket: `npm run lint` con 0 errores, `npm run format:check` OK, criterios de
  aceptación cumplidos y probado a mano (curl, REST Client o navegador). Mostrame cómo lo probaste.

---

## 1. Contexto

- **Qué es:** un videojuego web para enseñar a programar con minijuegos interactivos. Estética
  **vikinga**, inspirado en **Duolingo** (colorido, recompensas, sensación de logro, rachas).
- **Para quién:** chicos de secundaria y cualquier persona **sin conocimientos previos** de
  programación que quiera dar sus primeros pasos.
- **Qué enseña:** lógica de programación, sintaxis de **C#** (básico y POO) y **SQL**.
- **Por qué existe:** hoy la corrección de código, la validación de ejercicios de lógica, la
  evaluación de normalización de datos y el seguimiento del aprendizaje se hacen a mano; los errores
  más comunes están en la **sintaxis** y en la **retención de conceptos** a largo plazo.
- **Proyecto:** tesis final de un grupo de estudiantes de la UTN (Holmquist Jeremy, Roldán Enzo,
  Díaz José Simón, Mussa Agustín). Se busca un trabajo **profesional, modular y bien
  estructurado**.
- **Referencia visual:** mockup en Google Stitch (estilo vikingo). Personaje guía: **Björn**.

## 2. Objetivos

**General:** desarrollar un videojuego para enseñar a programar en distintos lenguajes mediante
minijuegos interactivos.

**Específicos:**

1. Registrar perfiles de jugadores y su progreso.
2. Enseñar lógica de programación y sintaxis de C# y SQL.
3. Implementar distintos minijuegos interactivos enfocados en resolver problemas.
4. Desbloquear recompensas visuales (artes, diseños de personajes, avatares, plantillas) al
   superar niveles.

## 3. Alcance

### Dentro del alcance

- Registro, inicio de sesión y gestión de la cuenta del jugador.
- Pantalla de inicio, ajustes (volumen de música y brillo) e introducción con el personaje guía.
- Mapa de zonas temáticas con niveles que se desbloquean en orden.
- Teoría por zona (video corto + resumen) al entrar al primer nivel de cada zona.
- Niveles con desafíos de 5 tipos, 3 vidas, pistas progresivas y mensajes de ánimo.
- Validación de las respuestas en el servidor, incluida la **sintaxis** del código escrito por el
  jugador (por reglas, **sin compilar ni ejecutar** nada).
- Registro automático del progreso, estrellas, récords y racha de días.
- Recompensas desbloqueables y galería de arte.
- Asistente IA que orienta sin dar la solución.
- Pantalla final al completar todo el juego.
- Panel de administración de contenido y estadísticas de uso.

### Fuera del alcance

- Compilar o ejecutar código del jugador (C# o SQL) en el servidor o en el equipo local.
- Pagos online.
- Foros, chat o cualquier interacción en tiempo real entre jugadores (multijugador).
- Gestión de instituciones educativas o profesores.
- Certificaciones oficiales o certificados en PDF.
- Recuperación de contraseña por email, login con redes sociales.
- Traducciones (i18n): el juego es solo en español.
- App móvil nativa (es web responsive).

### Límites del sistema

El sistema empieza cuando el jugador entra a Deventure y accede a la introducción, los niveles y los
desafíos. Deventure se ocupa de la **experiencia de aprendizaje dentro del juego**: mostrar
contenidos, desafíos, progreso, niveles y resultados. No gestiona procesos educativos o
administrativos externos.

## 4. Actores y permisos

<<<<<<< HEAD
| Actor                     | Descripción                             | Puede                                                                                                                                                         |
| ------------------------- | --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Visitante                 | Persona sin sesión iniciada             | Ver la pantalla de inicio, registrarse, iniciar sesión                                                                                                        |
| Jugador (`player`)        | Usuario registrado                      | Ver la intro, jugar niveles desbloqueados, pedir pistas, usar el asistente, ver su progreso y galería, cambiar ajustes, editar o borrar su cuenta             |
| Administrador (`admin`)   | Responsable del contenido               | Todo lo del jugador + administrar zonas, niveles, desafíos y pistas, publicar/archivar, previsualizar desafíos, ver estadísticas y llamadas internas fallidas |
| Sistema de almacenamiento | PostgreSQL (una base por microservicio) | Guarda cuentas, contenido, sesiones, progreso y recompensas                                                                                                   |

## 5. Requerimientos funcionales

| Id   | Requerimiento                                                                   | Tickets                              |
| ---- | ------------------------------------------------------------------------------- | ------------------------------------ |
| RF01 | Mostrar una introducción sobre qué es Deventure, qué se aprende y cómo se juega | DEV-11                               |
| RF02 | Mostrar los niveles disponibles en un mapa de zonas                             | DEV-12, DEV-14                       |
| RF03 | Desbloquear niveles y zonas al cumplir las condiciones para avanzar             | DEV-13                               |
| RF04 | Presentar desafíos sobre conceptos de programación                              | DEV-02, DEV-15, contenido DEV-26..29 |
| RF05 | Permitir resolver los desafíos (5 tipos de minijuego)                           | DEV-16, DEV-17, DEV-18, DEV-22       |
| RF06 | Comprobar la respuesta e indicar si es correcta o incorrecta, con explicación   | DEV-16..19, DEV-22                   |
| RF07 | Dar ayuda: pistas, teoría de la zona y asistente IA                             | DEV-23, DEV-25, DEV-24               |
| RF08 | Registrar el progreso del jugador                                               | DEV-07, DEV-44                       |
| RF09 | Mostrar el progreso (niveles, desafíos, estrellas, racha)                       | DEV-08                               |
| RF10 | Administrar contenidos y desafíos                                               | DEV-33                               |
| RF11 | Registrar jugadores e iniciar sesión                                            | DEV-06                               |
| RF12 | Ajustar el volumen de la música (o silenciarla) y el brillo                     | DEV-04, DEV-05                       |
| RF13 | Desbloquear recompensas y mostrarlas en una galería                             | DEV-31, DEV-32                       |
| RF14 | Mostrar mensajes de ánimo al equivocarse o perder                               | DEV-20                               |
| RF15 | Mostrar el resultado de cada nivel ganado                                       | DEV-21                               |
| RF16 | Gestionar la cuenta (editar username y contraseña, borrar cuenta)               | DEV-09                               |
| RF17 | Mostrar una pantalla final al completar el juego                                | DEV-30                               |
| RF18 | Mostrar estadísticas de uso al administrador                                    | DEV-34                               |

## 6. Requerimientos no funcionales

| Id    | Requerimiento                                                              | Cómo se mide                                                                                          |
| ----- | -------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| RNF01 | Usabilidad: interfaz simple para alguien sin conocimientos de programación | Navegable con teclado y con foco visible; responsive en 360, 768 y 1440 px sin scroll horizontal      |
| RNF02 | Facilidad de aprendizaje: instrucciones claras                             | Enunciados cortos, segunda persona ("vos"), un concepto por desafío                                   |
| RNF03 | Rendimiento                                                                | Lighthouse Performance ≥ 85 en `/map`; p95 < 300 ms en los endpoints de lectura con 50 usuarios       |
| RNF04 | Seguridad: el progreso no se puede modificar sin autorización              | Reglas anti-trampa de la sección 9.10; contraseñas con bcrypt; JWT; rutas internas protegidas         |
| RNF05 | Compatibilidad                                                             | Últimas versiones de Chrome, Firefox y Edge, escritorio y celular                                     |
| RNF06 | Mantenibilidad: agregar niveles y desafíos sin rehacer el sistema          | El contenido vive en la base y se carga por seed o panel admin; microservicios; reglas de `CLAUDE.md` |
| RNF07 | Accesibilidad del contenido: lenguaje sencillo                             | Lighthouse Accessibility ≥ 90; 0 violaciones graves de axe; respetar "reducir movimiento"             |
=======
| Actor | Descripción | Puede |
|---|---|---|
| Visitante | Persona sin sesión iniciada | Ver la pantalla de inicio, registrarse, iniciar sesión |
| Jugador (`player`) | Usuario registrado | Ver la intro, jugar niveles desbloqueados, pedir pistas, usar el asistente, ver su progreso y galería, cambiar ajustes, editar o borrar su cuenta |
| Administrador (`admin`) | Responsable del contenido | Todo lo del jugador + administrar zonas, niveles, desafíos y pistas, publicar/archivar, previsualizar desafíos, ver estadísticas y llamadas internas fallidas |
| Sistema de almacenamiento | PostgreSQL (una base por microservicio) | Guarda cuentas, contenido, sesiones, progreso y recompensas |

## 5. Requerimientos funcionales

| Id | Requerimiento | Tickets |
|---|---|---|
| RF01 | Mostrar una introducción sobre qué es Deventure, qué se aprende y cómo se juega | DEV-11 |
| RF02 | Mostrar los niveles disponibles en un mapa de zonas | DEV-12, DEV-14 |
| RF03 | Desbloquear niveles y zonas al cumplir las condiciones para avanzar | DEV-13 |
| RF04 | Presentar desafíos sobre conceptos de programación | DEV-02, DEV-15, contenido DEV-26..29 |
| RF05 | Permitir resolver los desafíos (5 tipos de minijuego) | DEV-16, DEV-17, DEV-18, DEV-22 |
| RF06 | Comprobar la respuesta e indicar si es correcta o incorrecta, con explicación | DEV-16..19, DEV-22 |
| RF07 | Dar ayuda: pistas, teoría de la zona y asistente IA | DEV-23, DEV-25, DEV-24 |
| RF08 | Registrar el progreso del jugador | DEV-07, DEV-44 |
| RF09 | Mostrar el progreso (niveles, desafíos, estrellas, racha) | DEV-08 |
| RF10 | Administrar contenidos y desafíos | DEV-33 |
| RF11 | Registrar jugadores e iniciar sesión | DEV-06 |
| RF12 | Ajustar el volumen de la música (o silenciarla) y el brillo | DEV-04, DEV-05 |
| RF13 | Desbloquear recompensas y mostrarlas en una galería | DEV-31, DEV-32 |
| RF14 | Mostrar mensajes de ánimo al equivocarse o perder | DEV-20 |
| RF15 | Mostrar el resultado de cada nivel ganado | DEV-21 |
| RF16 | Gestionar la cuenta (editar username y contraseña, borrar cuenta) | DEV-09 |
| RF17 | Mostrar una pantalla final al completar el juego | DEV-30 |
| RF18 | Mostrar estadísticas de uso al administrador | DEV-34 |

## 6. Requerimientos no funcionales

| Id | Requerimiento | Cómo se mide |
|---|---|---|
| RNF01 | Usabilidad: interfaz simple para alguien sin conocimientos de programación | Navegable con teclado y con foco visible; responsive en 360, 768 y 1440 px sin scroll horizontal |
| RNF02 | Facilidad de aprendizaje: instrucciones claras | Enunciados cortos, segunda persona ("vos"), un concepto por desafío |
| RNF03 | Rendimiento | Lighthouse Performance ≥ 85 en `/map`; p95 < 300 ms en los endpoints de lectura con 50 usuarios |
| RNF04 | Seguridad: el progreso no se puede modificar sin autorización | Reglas anti-trampa de la sección 9.10; contraseñas con bcrypt; JWT; rutas internas protegidas |
| RNF05 | Compatibilidad | Últimas versiones de Chrome, Firefox y Edge, escritorio y celular |
| RNF06 | Mantenibilidad: agregar niveles y desafíos sin rehacer el sistema | El contenido vive en la base y se carga por seed o panel admin; microservicios; reglas de `CLAUDE.md` |
| RNF07 | Accesibilidad del contenido: lenguaje sencillo | Lighthouse Accessibility ≥ 90; 0 violaciones graves de axe; respetar "reducir movimiento" |
>>>>>>> 91d40d8 (Development (#1))

## 7. Recorrido del jugador

1. **Inicio** (`/`): logo de Deventure y tres botones: **Jugar**, **Ajustes** y **Salir**.
   - Jugar: sin sesión → `/login`; con sesión y sin intro vista → `/intro`; si no → `/map`.
   - Salir: pide confirmación ("¿Seguro que querés salir?"); "Sí" cierra la sesión.
2. **Registro / Login** (`/register`, `/login`).
3. **Introducción** (`/intro`): Björn presenta el juego, qué se aprende y la dinámica (mapa,
   niveles, vidas, pistas, recompensas). Texto tipo máquina de escribir, "Saltar intro" siempre
   visible. Se muestra una sola vez; se puede volver a ver desde Ajustes.
4. **Mapa** (`/map`): zonas en orden con un camino de niveles (bloqueado, disponible, completado
   con estrellas). Barra superior con usuario, estrellas totales, Ajustes, Progreso y Galería.
5. **Teoría de la zona**: al entrar por primera vez al primer nivel de una zona, video corto +
   resumen con ejemplos. "Saltar" o "¡Entendido, a jugar!". "📖 Repasar teoría" disponible en el
   nivel.
6. **Nivel** (`/level/:levelId`): "Desafío X de N", 3 vidas, enunciado, respuesta, "Comprobar",
   pistas 💡, asistente IA, mensajes de ánimo.
7. **Resultado**: nivel ganado (estrellas, estadísticas, recompensas, siguiente nivel) o nivel
   perdido ("No te rindas, sé que podés hacerlo mejor", reintentar o volver al mapa).
8. **Mi progreso** (`/progress`) y **Galería** (`/gallery`).
9. **Final** (`/the-end`): al completar todos los niveles, mensaje "¡Gracias por jugar! Esperamos
   haberte hecho interesar por este hermoso mundo de la programación", estadísticas y créditos.

Pantallas de admin: `/admin` (zonas, niveles y desafíos) y `/admin/stats`.

## 8. Contenido educativo

<<<<<<< HEAD
| Orden | Zona (slug)                     | Lenguaje                | Niveles                                                                                                                                                                                         |
| ----- | ------------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1     | Lógica básica (`logica-basica`) | Pseudocódigo en español | 1 ¿Qué es un programa? · 2 Variables · 3 Tipos de datos · 4 Operadores · 5 Condicionales                                                                                                        |
| 2     | C# básico (`csharp-basico`)     | C#                      | 1 Tu primer programa · 2 Tipos y variables · 3 Operadores · 4 Decisiones (`if`, `switch`) · 5 Bucles · 6 Métodos                                                                                |
| 3     | POO en C# (`poo-csharp`)        | C#                      | 1 Clases y objetos · 2 Propiedades y métodos · 3 Constructores · 4 Encapsulamiento · 5 Herencia · 6 Polimorfismo e interfaces                                                                   |
| 4     | SQL (`sql`)                     | SQL                     | 1 Tablas, filas y columnas · 2 SELECT y FROM · 3 WHERE · 4 ORDER BY y LIMIT · 5 Agrupar (COUNT, SUM, GROUP BY, HAVING) · 6 JOIN · 7 INSERT, UPDATE, DELETE · 8 (opcional) Normalización 1FN-3FN |
=======
| Orden | Zona (slug) | Lenguaje | Niveles |
|---|---|---|---|
| 1 | Lógica básica (`logica-basica`) | Pseudocódigo en español | 1 ¿Qué es un programa? · 2 Variables · 3 Tipos de datos · 4 Operadores · 5 Condicionales |
| 2 | C# básico (`csharp-basico`) | C# | 1 Tu primer programa · 2 Tipos y variables · 3 Operadores · 4 Decisiones (`if`, `switch`) · 5 Bucles · 6 Métodos |
| 3 | POO en C# (`poo-csharp`) | C# | 1 Clases y objetos · 2 Propiedades y métodos · 3 Constructores · 4 Encapsulamiento · 5 Herencia · 6 Polimorfismo e interfaces |
| 4 | SQL (`sql`) | SQL | 1 Tablas, filas y columnas · 2 SELECT y FROM · 3 WHERE · 4 ORDER BY y LIMIT · 5 Agrupar (COUNT, SUM, GROUP BY, HAVING) · 6 JOIN · 7 INSERT, UPDATE, DELETE · 8 (opcional) Normalización 1FN-3FN |
>>>>>>> 91d40d8 (Development (#1))

Reglas del contenido:

- Cada nivel tiene 4 a 7 desafíos, al menos 2 tipos distintos, dificultad creciente (el primero
  fácil, el último integra todo).
- Cada desafío tiene enunciado, explicación de la respuesta correcta, al menos 1 error común con su
  mensaje y de 1 a 3 pistas progresivas.
- Lenguaje simple, segunda persona ("vos"), sin jerga sin explicar. Ejemplos cotidianos (edad,
  precio, puntaje, temperatura) y un **universo vikingo** consistente (clases `Vikingo`,
  `Guerrero`, `Barco`; tablas `vikingos`, `aldeas`).
- En SQL cada desafío muestra las tablas de ejemplo y, al acertar, el resultado esperado.
- Todos los ejemplos de C# y SQL se verifican fuera del juego antes de cargarlos.
- El contenido se carga con seeds idempotentes (se pueden correr muchas veces sin duplicar) y luego
  se mantiene desde el panel admin.

## 9. Reglas de negocio

### 9.1 Cuentas y sesión

- RN-01 · Username de 3 a 20 caracteres `[a-zA-Z0-9_]`, único **sin distinguir mayúsculas**
  ("Ragnar" = "ragnar").
- RN-02 · Email válido, máximo 254 caracteres, único sin distinguir mayúsculas.
- RN-03 · Contraseña de 8 a 72 caracteres con al menos una letra y un número. Se guarda con
  bcrypt; nunca se devuelve ni se loguea.
- RN-04 · Login con username **o** email. Si el usuario no existe o la contraseña es incorrecta,
  el mensaje es el mismo ("Usuario o contraseña incorrectos").
- RN-05 · 5 contraseñas incorrectas dentro de 15 minutos bloquean la cuenta 15 minutos (423
  `ACCOUNT_LOCKED`, aunque después se ponga la contraseña correcta). Un login correcto reinicia el
  contador.
- RN-06 · La sesión es un JWT `{ sub, role, username }` (HS256) que vence a las 24 horas.
- RN-07 · Cambiar la contraseña exige la contraseña actual. Borrar la cuenta exige la contraseña y
  confirmar tipeando el username; borra los datos del jugador en **todos** los servicios.

### 9.2 Introducción y ajustes

- RN-08 · La intro se muestra hasta que el jugador la termina o la salta (`introSeen = true`).
- RN-09 · Ajustes guardados en la cuenta (se conservan entre dispositivos): volumen de música
  0-100 y silencio, y brillo 50-150 (100 = normal). Al quitar el silencio vuelve el volumen
  anterior. **A confirmar:** volumen de efectos separado. La descripción de DEV-04 lo deja fuera de
  alcance, pero su checklist lo pide, y el schema de auth ya tiene las claves `sfxVolume` y
  `sfxMuted`. Preguntame antes de implementarlo.

### 9.3 Mapa y desbloqueo

- RN-10 · Zonas y niveles se muestran en su orden y solo si están publicados.
- RN-11 · Un jugador nuevo tiene desbloqueado únicamente el **primer nivel de la primera zona**.
- RN-12 · Ganar el nivel N desbloquea el N+1 de la misma zona; ganar el último nivel de una zona
  desbloquea el primer nivel de la zona siguiente (y se avisa "¡Nueva zona desbloqueada!").
- RN-13 · Lo desbloqueado **nunca** se vuelve a bloquear. Perder o repetir un nivel no cambia el
  desbloqueo.
- RN-14 · Un nivel bloqueado no se puede jugar: el servidor lo rechaza (403 `LEVEL_LOCKED`).

### 9.4 Sesión de juego, vidas y estrellas

- RN-15 · Cada vez que el jugador entra a un nivel se crea una **sesión de juego** nueva. Recargar
  la página o reintentar crea otra sesión desde el desafío 1. El **servidor** decide vidas, aciertos
  y desafío actual; el navegador nunca.
- RN-16 · Cada nivel empieza con 3 vidas (configurable por nivel).
- RN-17 · Respuesta incorrecta: −1 vida y mensaje de ánimo. Con 0 vidas el nivel se pierde.
- RN-18 · Respuesta correcta: pasa al siguiente desafío. Correcta en el último desafío: nivel
  ganado.
- RN-19 · **Estrellas = vidas restantes al ganar** (3 → ⭐⭐⭐, 2 → ⭐⭐, 1 → ⭐).
- RN-20 · Mejor resultado de un nivel: más estrellas; si empata, menor tiempo. Repetir un nivel
  nunca baja el mejor resultado y suma un intento.
- RN-21 · Dos clics rápidos no pueden restar dos vidas (operación atómica).
- RN-22 · Una sesión `won`, `lost` o `abandoned` no acepta más intentos (409 `SESSION_CLOSED`).
- RN-23 · Sesiones abiertas por más de 2 horas pasan a `abandoned`.

### 9.5 Tipos de desafío y validación

El código del jugador **nunca se compila ni se ejecuta**: se valida comparando con reglas.

<<<<<<< HEAD
| Tipo              | El jugador...                                                       | Es correcta si...                                                                                                                                                      |
| ----------------- | ------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `multiple_choice` | elige una opción (las opciones se mezclan)                          | eligió la opción correcta                                                                                                                                              |
| `order_blocks`    | ordena bloques de código (drag & drop, también con teclado y touch) | el orden coincide con alguno de los órdenes válidos; si no, se marca la primera línea mal                                                                              |
| `fill_code`       | completa huecos o escribe código libre (editor con resaltado)       | modo huecos: cada hueco está entre sus respuestas válidas; modo libre: igual a una respuesta aceptada o contiene los tokens requeridos en orden, después de normalizar |
| `find_bug`        | elige la línea con el error y la corrección                         | línea y corrección correctas ("encontraste la línea, pero esa no es la corrección")                                                                                    |
| `predict_output`  | escribe qué imprime el código                                       | la salida coincide línea por línea (ignorando espacios al final y líneas vacías finales)                                                                               |
=======
| Tipo | El jugador... | Es correcta si... |
|---|---|---|
| `multiple_choice` | elige una opción (las opciones se mezclan) | eligió la opción correcta |
| `order_blocks` | ordena bloques de código (drag & drop, también con teclado y touch) | el orden coincide con alguno de los órdenes válidos; si no, se marca la primera línea mal |
| `fill_code` | completa huecos o escribe código libre (editor con resaltado) | modo huecos: cada hueco está entre sus respuestas válidas; modo libre: igual a una respuesta aceptada o contiene los tokens requeridos en orden, después de normalizar |
| `find_bug` | elige la línea con el error y la corrección | línea y corrección correctas ("encontraste la línea, pero esa no es la corrección") |
| `predict_output` | escribe qué imprime el código | la salida coincide línea por línea (ignorando espacios al final y líneas vacías finales) |
>>>>>>> 91d40d8 (Development (#1))

- RN-24 · Normalización de código antes de comparar: quitar espacios sobrantes, espacios antes de
  `;` y `)`, palabras clave de SQL en mayúsculas, `;` final opcional en SQL.
- RN-25 · Antes de comparar se chequean paréntesis, llaves y comillas balanceadas ("Te falta
  cerrar un paréntesis").
- RN-26 · Si es incorrecta, se muestra el mensaje del primer **error común** que coincida (con el
  número de línea); si ninguno coincide: "Revisá la sintaxis, algo no está bien escrito".
- RN-27 · Código del jugador: máximo 2000 caracteres.
- RN-28 · Respuesta correcta: se muestra la explicación. En `order_blocks` y SQL se muestra la
  salida o el resultado esperado.

### 9.6 Ayudas

- RN-29 · **Pistas:** hasta 3 por desafío, progresivas (la 1ª orienta, la 2ª es más concreta, la
  3ª casi da la respuesta). Se entregan **de a una** y nunca todas juntas. **No restan vidas**;
  se cuentan como "pistas usadas". Las ya vistas se pueden volver a abrir sin pedirlas de nuevo.
- RN-30 · **Teoría de la zona:** al entrar por primera vez al primer nivel de una zona. Si el video
  no existe o falla, se muestra solo el resumen escrito. Videos con subtítulos en español.
- RN-31 · **Mensajes de ánimo:** al perder una vida, una frase al azar distinta de la anterior (se
  cierra sola a los 4 s). Al perder el nivel: "No te rindas, sé que podés hacerlo mejor". Si pierde
  el mismo nivel 3 veces seguidas: sugerir "Ver pista" o "Repasar teoría".
- RN-32 · **Asistente IA:** solo dentro de un nivel en curso. Responde preguntas como "¿cómo
  podría mejorar mi código?" o "¿en qué me equivoco?". Reglas:
  - Nunca da la solución completa.
  - Máximo 10 consultas por jugador por nivel (la 11ª: 429).
  - Si la IA no responde en 5 s, devuelve la siguiente pista del desafío como respuesta de
    respaldo.
  - La API key vive solo en el backend.
  - No es un chat libre fuera de los niveles, no tiene streaming y no muestra historial.

### 9.7 Resultado del nivel

- RN-33 · Nivel ganado muestra:
  - estrellas (animadas una por una) y confeti;
  - correctas al primer intento, vidas restantes, tiempo y pistas usadas;
  - "¡Nuevo récord!" si mejoró su mejor resultado;
  - recompensas desbloqueadas.
- RN-34 · Botones del resultado:
  - "Siguiente nivel" (o "Ir a la siguiente zona" / "Ver final");
  - "Repetir nivel";
  - "Volver al mapa", que anima el nivel recién desbloqueado.
- RN-35 · Si el progreso no se pudo guardar, el jugador lo ve ("lo reintentamos automáticamente")
  y el sistema lo reintenta solo hasta lograrlo.

### 9.8 Progreso

- RN-36 · "Mi progreso" muestra:
  - totales: % del juego, estrellas sobre el máximo, niveles completados sobre el total y racha;
  - por zona: %, estrellas y niveles con estado, mejores estrellas, intentos y fecha;
  - "Mejorar" en los niveles con menos de 3 estrellas;
  - las zonas bloqueadas, atenuadas y con candado.
- RN-37 · Máximo de estrellas = cantidad de niveles × 3.
- RN-38 · Racha = días consecutivos (terminando hoy o ayer) con al menos un nivel jugado.
- RN-39 · El progreso solo se escribe por las reglas del servidor al ganar un nivel; no existe un
  endpoint público que lo modifique.

### 9.9 Recompensas y galería

- RN-40 · Tipos: arte, personaje, avatar y plantilla. Rareza: común (gris), rara (azul) y épica
  (violeta).
- RN-41 · Reglas de desbloqueo: completar un nivel, completar una zona, zona perfecta (3⭐ en
  todos sus niveles) o juntar N estrellas en total.
- RN-42 · Cada recompensa se otorga **una sola vez**; repetir niveles no la duplica.
- RN-43 · La galería muestra todas las recompensas:
  - contador "Desbloqueaste X de Y" y filtros por tipo y estado;
  - las bloqueadas se ven como silueta con 🔒 y "cómo conseguirla", y la API **nunca** envía la
    imagen real de una recompensa bloqueada;
  - las nuevas llevan "¡Nuevo!" hasta que se abren;
  - un avatar se puede usar como avatar del jugador;
  - una plantilla se puede descargar.

### 9.10 Seguridad y anti-trampas

- RN-44 · El gateway borra `x-user-id`, `x-user-role` y `x-internal-token` que mande el navegador
  y los vuelve a poner desde el JWT.
- RN-45 · Las rutas `/internal/*` no existen desde afuera (404).
- RN-46 · Un jugador solo ve y usa sus propios datos (`x-user-id`); pedir datos de otro → 403.
- RN-47 · Solo se acepta un intento para el desafío actual de la sesión (si no, 400
  `CHALLENGE_MISMATCH`), y solo del dueño de la sesión (si no, 403).
- RN-48 · Tiempos mínimos: 2 s entre el inicio de la sesión y el primer acierto, y 1 s entre
  intentos. Si es menor, se rechaza con 429 `TOO_FAST`.
- RN-49 · Cada rechazo se loguea como `warn` con usuario, sesión, regla y correlation-id.
- RN-50 · La solución de un desafío nunca sale por la API pública.
- RN-51 · Rate limit: login y registro, 10 pedidos por minuto por IP; resto de la API, 300 por
  minuto.

### 9.11 Final del juego

- RN-52 · `/the-end` solo es accesible si el jugador completó todos los niveles; si no, redirige al
  mapa. Muestra el mensaje final, niveles, estrellas, tiempo total jugado, recompensas y créditos.

### 9.12 Administración

- RN-53 · Solo el rol `admin` accede a `/admin` y a `/api/admin/*` (player → 403 y redirección al
  mapa).
- RN-54 · Panel de contenido:
  - crear y editar zonas, niveles, desafíos y pistas;
  - reordenar (drag & drop) y publicar o despublicar;
  - las zonas **no se borran**, se archivan;
  - formulario dinámico según el tipo de desafío;
  - previsualizar y probar el desafío con el validador real antes de publicarlo.
- RN-55 · Cada acción de admin queda en un registro de auditoría (quién, qué, antes y después).
- RN-56 · Estadísticas:
  - usuarios totales, nuevos y activos en los últimos 7 días;
  - por nivel: jugadores que empezaron y que terminaron, intentos, % de fallos y tiempo promedio;
  - desafíos con más errores;
  - filtro por rango de fechas;
  - si un servicio no responde, el resto se muestra igual (respuesta parcial).
- RN-57 · El admin puede ver las llamadas internas que fallaron definitivamente.

## 10. Arquitectura (resumen; el detalle está en `CLAUDE.md`)

Microservicios Express que se comunican **solo por REST** (sin colas ni eventos). PostgreSQL con
**una base por servicio** y Prisma 6.19.3. Frontend React + Tailwind. JavaScript (ESM), Node 22.

<<<<<<< HEAD
| Servicio          | Puerto | Base         | Responsabilidad                                                                                |
| ----------------- | ------ | ------------ | ---------------------------------------------------------------------------------------------- |
| api-gateway       | 3000   | —            | Única entrada pública `/api/*`: JWT, roles, CORS, rate limit, bloqueo de `/internal`, proxy    |
| auth-service      | 3001   | auth_db      | Cuentas, credenciales, roles, ajustes, avatar, bloqueo de login                                |
| content-service   | 3002   | content_db   | Zonas, niveles, desafíos (con solución), pistas, teoría, auditoría de admin                    |
| gameplay-service  | 3003   | gameplay_db  | Sesiones de juego, intentos, validadores, vidas, estrellas, pistas usadas, reintentos internos |
| progress-service  | 3004   | progress_db  | Progreso por nivel, desbloqueos, teoría vista, resúmenes, racha                                |
| rewards-service   | 3005   | rewards_db   | Catálogo de recompensas, reglas, recompensas obtenidas                                         |
| assistant-service | 3006   | assistant_db | Asistente IA (opcional, prioridad media)                                                       |
| frontend          | 5173   | —            | React + Tailwind                                                                               |
=======
| Servicio | Puerto | Base | Responsabilidad |
|---|---|---|---|
| api-gateway | 3000 | — | Única entrada pública `/api/*`: JWT, roles, CORS, rate limit, bloqueo de `/internal`, proxy |
| auth-service | 3001 | auth_db | Cuentas, credenciales, roles, ajustes, avatar, bloqueo de login |
| content-service | 3002 | content_db | Zonas, niveles, desafíos (con solución), pistas, teoría, auditoría de admin |
| gameplay-service | 3003 | gameplay_db | Sesiones de juego, intentos, validadores, vidas, estrellas, pistas usadas, reintentos internos |
| progress-service | 3004 | progress_db | Progreso por nivel, desbloqueos, teoría vista, resúmenes, racha |
| rewards-service | 3005 | rewards_db | Catálogo de recompensas, reglas, recompensas obtenidas |
| assistant-service | 3006 | assistant_db | Asistente IA (opcional, prioridad media) |
| frontend | 5173 | — | React + Tailwind |
>>>>>>> 91d40d8 (Development (#1))

Flujos internos clave:

- **Nivel ganado:** gameplay cierra la sesión (`won`), llama a `POST progress
<<<<<<< HEAD
/internal/level-completions`, después a `POST rewards /internal/evaluations` y responde al
=======
  /internal/level-completions`, después a `POST rewards /internal/evaluations` y responde al
>>>>>>> 91d40d8 (Development (#1))
  jugador con resultado, desbloqueos y recompensas. Los dos endpoints son **idempotentes por
  `sessionId`**. Si uno falla, la llamada se guarda en `pending_internal_calls` y un job la
  reintenta cada 30 s con espera creciente; a los 10 fallos queda `failed` y la ve el admin.
- **Crear sesión:** gameplay pide a content el resumen del nivel (desafíos en orden, vidas
  iniciales, siguiente nivel) y a progress si el nivel está desbloqueado.
- **Intento:** gameplay pide a content el desafío **con** la solución (solo por `/internal`), valida
  y guarda el intento. La solución nunca se guarda en gameplay.
- **Borrar cuenta:** auth llama `DELETE /internal/users/:userId` en gameplay, progress, rewards y
  assistant (en ese orden), con reintentos si falla.

## 11. Modelo de datos (entidades principales)

- **auth:** `User` (username y email `citext` únicos, passwordHash, role, introSeen, avatar,
  settings JSON, contador de intentos fallidos, lockedUntil, lastLoginAt) y `PendingInternalCall`.
- **content:**
  - `Zone`: slug, nombre, descripción, orden, video, resumen de teoría, publicada;
  - `Level`: zona, orden, título, vidas iniciales, publicado;
  - `Challenge`: nivel, orden, tipo, lenguaje (`pseudo`, `csharp`, `sql`), enunciado, `payload`
    (lo que ve el jugador), `solution` (privada), explicación, errores comunes;
  - `Hint` (orden 1 a 3) y `AuditLog`.
- **gameplay:**
  - `GameSession`: usuario, nivel, zona, ids de desafíos en orden, índice actual, vidas
    iniciales y restantes, pistas usadas, estado, estrellas, duración, fechas;
  - `Attempt`, `HintRequest` y `PendingInternalCall`.
- **progress:** `Player`, `LevelProgress` (mejores estrellas, vidas y tiempo, intentos, fechas),
  `UnlockedLevel`, `TheoryView` y `ProcessedCompletion` (idempotencia).
- **rewards:** `Reward` (slug, tipo, rareza, imagen, silueta, regla), `PlayerReward` (fecha, visto)
  y `ProcessedEvaluation`.
- **assistant:** `AssistantQuery` (usuario, sesión, nivel, desafío, número de consulta 1 a 10,
  pregunta, respuesta, origen IA o pista).

Los ids de otro servicio se guardan como `uuid` sin foreign key. Los seeds usan ids fijos para que
las referencias entre servicios sobrevivan a un reset.

## 12. API pública (por el gateway, prefijo `/api`)

<<<<<<< HEAD
| Servicio  | Endpoints                                                                                                                                                                                                                             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| auth      | `POST /auth/register` · `POST /auth/login` · `GET /auth/me` · `PATCH /auth/me/intro-seen` · `GET` y `PATCH /auth/me/settings` · `PATCH /auth/me` (username) · `PATCH /auth/me/password` · `PATCH /auth/me/avatar` · `DELETE /auth/me` |
| content   | `GET /content/zones` · `GET /content/levels/:levelId` (sin solución) · `GET /content/zones/:zoneId/theory`                                                                                                                            |
| gameplay  | `POST /gameplay/sessions` · `GET /gameplay/sessions/:id` · `PATCH /gameplay/sessions/:id` (`{ status: 'abandoned' }`) · `POST /gameplay/sessions/:id/attempts` · `POST /gameplay/sessions/:id/hints`                                  |
| progress  | `GET /progress/me` · `GET /progress/me/summary` · `GET` y `POST /progress/me/theory-seen`                                                                                                                                             |
| rewards   | `GET /rewards/me?type=&status=` · `PATCH /rewards/me/:rewardId/seen`                                                                                                                                                                  |
| assistant | `POST /assistant/hints`                                                                                                                                                                                                               |
| admin     | `/admin/content/*` (CRUD, orden, publicar, `preview-validate`) · `/admin/stats` · `/admin/gameplay/pending-calls`                                                                                                                     |
=======
| Servicio | Endpoints |
|---|---|
| auth | `POST /auth/register` · `POST /auth/login` · `GET /auth/me` · `PATCH /auth/me/intro-seen` · `GET` y `PATCH /auth/me/settings` · `PATCH /auth/me` (username) · `PATCH /auth/me/password` · `PATCH /auth/me/avatar` · `DELETE /auth/me` |
| content | `GET /content/zones` · `GET /content/levels/:levelId` (sin solución) · `GET /content/zones/:zoneId/theory` |
| gameplay | `POST /gameplay/sessions` · `GET /gameplay/sessions/:id` · `POST /gameplay/sessions/:id/abandon` · `POST /gameplay/sessions/:id/attempts` · `POST /gameplay/sessions/:id/hints` |
| progress | `GET /progress/me` · `GET /progress/me/summary` · `GET` y `POST /progress/me/theory-seen` |
| rewards | `GET /rewards/me?type=&status=` · `PATCH /rewards/me/:rewardId/seen` |
| assistant | `POST /assistant/hints` |
| admin | `/admin/content/*` (CRUD, orden, publicar, `preview-validate`) · `/admin/stats` · `/admin/gameplay/pending-calls` |
>>>>>>> 91d40d8 (Development (#1))

Formato: éxito `{ "data": ... }`, error `{ "error": { "code", "message", "details" } }`. Códigos
usados: 400, 401, 403, 404, 409, 413, 423, 429, 500 y 503.

## 13. Etapas: MVP y producto completo

- **MVP (prioridad alta, P01 a P24):** alguien se registra, ve la intro y el mapa, juega la zona
  "Lógica básica" completa con los 3 tipos básicos de desafío, vidas, estrellas, pistas, teoría y
  mensajes de ánimo, y su progreso se guarda y desbloquea niveles.
- **Producto completo (P25 a P46):**
  - anti-trampas, "Mi progreso", recompensas y galería;
  - zonas C#, POO y SQL;
  - panel admin, reintentos internos, 2 minijuegos nuevos y arte final;
  - asistente IA, accesibilidad, rendimiento y deploy;
  - ajustes, gestión de cuenta, pantalla final y estadísticas;
  - tests de contrato y observabilidad.

## 14. Prioridades (colores del tablero)

- 🔴 **Alta:** sin esto el producto no anda (P01 a P24).
- 🟡 **Media:** importante, puede esperar (P25 a P39).
- 🟢 **Baja:** mejoras (P40 a P46).

## 15. Backlog por prioridad (orden de implementación)

Las cards de Trello tienen el detalle técnico de cada ticket (endpoints, formatos, criterios de
aceptación). Adaptá sus rutas y ejemplos según la sección 16.

<<<<<<< HEAD
| P   | Ticket | Qué                                                 | Estado esperado del repo                                                                                           |
| --- | ------ | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| P01 | DEV-01 | Monorepo, ESLint, Prettier, Husky, commitlint       | Backend hecho (con reglas de ADR-002 en ESLint); falta `apps/web` (Vite + React + Tailwind con colores `viking-*`) |
| P02 | DEV-42 | Docker Compose con Postgres y servicios             | Hecho para postgres, gateway y los 5 servicios; sumar el frontend al crearlo                                       |
| P03 | DEV-39 | Código compartido de los servicios                  | Hecho como `packages/service-kit`                                                                                  |
| P04 | DEV-40 | Esquemas Zod compartidos                            | Hecho como `packages/contracts` (auth); cada servicio suma los suyos                                               |
| P05 | DEV-43 | CI                                                  | Hecho (lint, formato, `prisma validate`, tests de los workspaces que cambian)                                      |
| P06 | DEV-38 | API Gateway                                         | Hecho: proxies a los 5 servicios y rutas `/api/admin/*`                                                            |
| P07 | DEV-06 | Registro e inicio de sesión                         | Backend hecho; faltan las pantallas React y el contexto de sesión                                                  |
| P08 | DEV-02 | content-service: zonas, niveles, desafíos, pistas   | Pendiente                                                                                                          |
| P09 | DEV-03 | Pantalla de inicio (Jugar, Ajustes, Salir)          | Pendiente                                                                                                          |
| P10 | DEV-11 | Introducción con Björn                              | Pendiente                                                                                                          |
| P11 | DEV-12 | Mapa de zonas y niveles                             | Pendiente                                                                                                          |
| P12 | DEV-15 | Pantalla de nivel + sesiones de juego               | Pendiente                                                                                                          |
| P13 | DEV-16 | Opción múltiple + endpoint de intentos              | Pendiente                                                                                                          |
| P14 | DEV-19 | 3 vidas, nivel perdido, estrellas                   | Pendiente                                                                                                          |
| P15 | DEV-41 | Cliente REST interno + token interno                | Pendiente                                                                                                          |
| P16 | DEV-07 | progress-service: guardar progreso                  | Pendiente                                                                                                          |
| P17 | DEV-13 | Desbloqueo de nivel y zona                          | Pendiente                                                                                                          |
| P18 | DEV-17 | Ordenar bloques de código                           | Pendiente                                                                                                          |
| P19 | DEV-18 | Completar / escribir código                         | Pendiente                                                                                                          |
| P20 | DEV-20 | Mensajes de ánimo                                   | Pendiente                                                                                                          |
| P21 | DEV-21 | Pantalla de nivel ganado                            | Pendiente                                                                                                          |
| P22 | DEV-23 | Pistas progresivas                                  | Pendiente                                                                                                          |
| P23 | DEV-25 | Teoría de la zona                                   | Pendiente                                                                                                          |
| P24 | DEV-26 | Contenido "Lógica básica" (cierra el MVP)           | Pendiente                                                                                                          |
| P25 | DEV-10 | Anti-trampas                                        | Pendiente                                                                                                          |
| P26 | DEV-08 | Mi progreso                                         | Pendiente                                                                                                          |
| P27 | DEV-31 | rewards-service                                     | Pendiente                                                                                                          |
| P28 | DEV-32 | Galería                                             | Pendiente                                                                                                          |
| P29 | DEV-27 | Contenido "C# básico"                               | Pendiente                                                                                                          |
| P30 | DEV-28 | Contenido "POO en C#"                               | Pendiente                                                                                                          |
| P31 | DEV-29 | Contenido "SQL"                                     | Pendiente                                                                                                          |
| P32 | DEV-33 | Panel de administración de contenido                | Pendiente                                                                                                          |
| P33 | DEV-44 | Reintento de llamadas internas                      | Pendiente                                                                                                          |
| P34 | DEV-22 | "Encontrá el bug" y "¿Qué imprime?"                 | Pendiente                                                                                                          |
| P35 | DEV-14 | Arte vikingo y animaciones del mapa                 | Pendiente                                                                                                          |
| P36 | DEV-24 | Asistente IA                                        | Pendiente                                                                                                          |
| P37 | DEV-35 | Usabilidad y accesibilidad                          | Pendiente                                                                                                          |
| P38 | DEV-36 | Rendimiento                                         | Pendiente                                                                                                          |
| P39 | DEV-37 | Deploy y documentación final                        | Pendiente                                                                                                          |
| P40 | DEV-04 | Volumen de música (efectos: a confirmar, ver RN-09) | Pendiente                                                                                                          |
| P41 | DEV-05 | Brillo                                              | Pendiente                                                                                                          |
| P42 | DEV-09 | Gestionar cuenta                                    | Pendiente                                                                                                          |
| P43 | DEV-30 | Pantalla final                                      | Pendiente                                                                                                          |
| P44 | DEV-34 | Estadísticas para admin                             | Pendiente                                                                                                          |
| P45 | DEV-46 | Tests de contrato entre servicios                   | Pendiente (el equipo decidió no hacer tests por ahora; confirmar antes)                                            |
| P46 | DEV-45 | Observabilidad (OpenTelemetry)                      | Pendiente                                                                                                          |

## 16. Adaptaciones obligatorias respecto de las cards de Trello

1. **Estructura** (la de las cards es la real):
   - servicios en `services/<x>`, código compartido en `packages/service-kit` y
     `packages/contracts`, frontend en `apps/web`;
   - Docker en `infra/docker-compose.yml` e `infra/postgres/init.sql`.

   Un servicio nuevo copia la estructura de `services/auth-service`
   (`routes → controllers → services → repositories`) y suma su proxy con
   `registerServiceRoutes` en `services/api-gateway/src/routes/proxies.js`. También hay que
   agregarlo a los filtros y a la lista `ALL` de `.github/workflows/ci.yml`, a
   `infra/postgres/init.sql` (su base) y a `infra/docker-compose.yml`. Su `schema.prisma` lleva
   `output = "../generated/prisma-client"` y se importa desde ahí, nunca desde `@prisma/client`
   (ver `CLAUDE.md`).

=======
| P | Ticket | Qué | Estado esperado del repo |
|---|---|---|---|
| P01 | DEV-01 | Monorepo, ESLint, Prettier, Husky, commitlint | Backend hecho; falta `frontend/` (Vite + React + Tailwind con colores `viking-*`) |
| P02 | DEV-42 | Docker Compose con Postgres y servicios | Hecho para postgres, auth y gateway; sumar cada servicio y el frontend al crearlos |
| P03 | DEV-39 | Código compartido de los servicios | Hecho como `backend/shared` |
| P04 | DEV-40 | Esquemas Zod compartidos | Hoy viven en cada módulo; **decidir conmigo** dónde van los que comparta el frontend |
| P05 | DEV-43 | CI | Hecho (lint, formato, `prisma validate`) |
| P06 | DEV-38 | API Gateway | Hecho para auth; sumar un proxy por servicio y las rutas `/api/admin/*` |
| P07 | DEV-06 | Registro e inicio de sesión | Backend hecho; faltan las pantallas React y el contexto de sesión |
| P08 | DEV-02 | content-service: zonas, niveles, desafíos, pistas | Pendiente |
| P09 | DEV-03 | Pantalla de inicio (Jugar, Ajustes, Salir) | Pendiente |
| P10 | DEV-11 | Introducción con Björn | Pendiente |
| P11 | DEV-12 | Mapa de zonas y niveles | Pendiente |
| P12 | DEV-15 | Pantalla de nivel + sesiones de juego | Pendiente |
| P13 | DEV-16 | Opción múltiple + endpoint de intentos | Pendiente |
| P14 | DEV-19 | 3 vidas, nivel perdido, estrellas | Pendiente |
| P15 | DEV-41 | Cliente REST interno + token interno | Pendiente |
| P16 | DEV-07 | progress-service: guardar progreso | Pendiente |
| P17 | DEV-13 | Desbloqueo de nivel y zona | Pendiente |
| P18 | DEV-17 | Ordenar bloques de código | Pendiente |
| P19 | DEV-18 | Completar / escribir código | Pendiente |
| P20 | DEV-20 | Mensajes de ánimo | Pendiente |
| P21 | DEV-21 | Pantalla de nivel ganado | Pendiente |
| P22 | DEV-23 | Pistas progresivas | Pendiente |
| P23 | DEV-25 | Teoría de la zona | Pendiente |
| P24 | DEV-26 | Contenido "Lógica básica" (cierra el MVP) | Pendiente |
| P25 | DEV-10 | Anti-trampas | Pendiente |
| P26 | DEV-08 | Mi progreso | Pendiente |
| P27 | DEV-31 | rewards-service | Pendiente |
| P28 | DEV-32 | Galería | Pendiente |
| P29 | DEV-27 | Contenido "C# básico" | Pendiente |
| P30 | DEV-28 | Contenido "POO en C#" | Pendiente |
| P31 | DEV-29 | Contenido "SQL" | Pendiente |
| P32 | DEV-33 | Panel de administración de contenido | Pendiente |
| P33 | DEV-44 | Reintento de llamadas internas | Pendiente |
| P34 | DEV-22 | "Encontrá el bug" y "¿Qué imprime?" | Pendiente |
| P35 | DEV-14 | Arte vikingo y animaciones del mapa | Pendiente |
| P36 | DEV-24 | Asistente IA | Pendiente |
| P37 | DEV-35 | Usabilidad y accesibilidad | Pendiente |
| P38 | DEV-36 | Rendimiento | Pendiente |
| P39 | DEV-37 | Deploy y documentación final | Pendiente |
| P40 | DEV-04 | Volumen de música (efectos: a confirmar, ver RN-09) | Pendiente |
| P41 | DEV-05 | Brillo | Pendiente |
| P42 | DEV-09 | Gestionar cuenta | Pendiente |
| P43 | DEV-30 | Pantalla final | Pendiente |
| P44 | DEV-34 | Estadísticas para admin | Pendiente |
| P45 | DEV-46 | Tests de contrato entre servicios | Pendiente (el equipo decidió no hacer tests por ahora; confirmar antes) |
| P46 | DEV-45 | Observabilidad (OpenTelemetry) | Pendiente |

## 16. Adaptaciones obligatorias respecto de las cards de Trello

1. **Estructura:**
   - `services/<x>` → `backend/<x>`;
   - `packages/service-kit` → `backend/shared` (`@deventure/shared/*`);
   - `apps/web` → `frontend/`;
   - `infra/docker-compose.yml` → `docker-compose.yml` en la raíz;
   - `infra/postgres/init.sql` → `docker/postgres/init.sql`.

   Un servicio nuevo copia la estructura de `backend/auth-service` y suma su proxy en
   `backend/api-gateway/src/proxies/`.
>>>>>>> 91d40d8 (Development (#1))
2. **Sin `map`, `filter`, `some`, `every`, `find`, `reduce`, `forEach`, `sort` ni loops en el
   backend.** Las cards tienen ejemplos con esos métodos: hay que resolverlo en la base o con un
   `Map`. Por ejemplo:
   - **Validador `order_blocks`:** comparar en Postgres con
     `EXISTS (SELECT 1 FROM jsonb_array_elements($validOrders) o WHERE o = $order::jsonb)`.
   - **Errores comunes de `fill_code`:** regex de Postgres,
     `SELECT message FROM jsonb_to_recordset($commonErrors) AS e(pattern text, message text) WHERE $code ~ e.pattern LIMIT 1`.
   - **Registro de validadores por tipo:** `new Map([[TYPE, validator]])` y `VALIDATORS.get(type)`.
   - **Motor de reglas de recompensas:** una consulta SQL que trae solo las recompensas cuya regla
     se cumple y no fueron obtenidas, y las inserta con `skipDuplicates`.
   - **Resumen de progreso, racha y estadísticas:** `groupBy`, `_count`, `_sum` o `$queryRaw` con
     `GROUP BY`; la respuesta sale armada desde la consulta.

   El frontend (React) **sí** puede usar `map` para renderizar listas: la regla es solo del
   backend.
<<<<<<< HEAD
   `npm run lint` hace cumplir esta regla en `services/**` y `packages/**`.

3. **Sin comentarios ni JSDoc** (las cards mencionan JSDoc: ignorarlo). **Sin mappers**: la forma
   de la respuesta la arma la consulta (`select` o `$queryRaw`).
4. **Sin tests automatizados obligatorios** (decisión del equipo). Las secciones "Cómo probarlo"
   de las cards se verifican a mano. Preguntá antes de agregar Vitest o Playwright. Los tests que
   ya existen (gateway, contracts, health) se mantienen en verde.
5. **Versiones:** Express 5, Zod 3.25, Prisma 6.19.3, http-proxy-middleware 3, ESLint 9,
   Node 22. Subir de versión (Zod 4, ESLint 10, etc.) es un ticket aparte.
=======
3. **Sin comentarios ni JSDoc** (las cards mencionan JSDoc: ignorarlo).
4. **Sin tests automatizados por ahora** (decisión del equipo). Las secciones "Cómo probarlo" de
   las cards se verifican a mano. Preguntá antes de agregar Vitest o Playwright.
5. **Versiones:** Express 5, Zod 4, Prisma 6.19.3 (con `prisma.config.js`), http-proxy-middleware
   4, ESLint 10, Node 22.
>>>>>>> 91d40d8 (Development (#1))
6. Operaciones que leen y escriben el mismo dato (vidas, intentos, desbloqueos, recompensas) van
   **atómicas en la base**: `UPDATE ... RETURNING`, `upsert`, transacción o `version` optimista.

## 17. Glosario

- **Zona:** grupo temático de niveles (Lógica básica, C# básico, POO en C#, SQL).
- **Nivel:** conjunto ordenado de desafíos que se juega con 3 vidas.
- **Desafío:** ejercicio de uno de los 5 tipos.
- **Sesión de juego:** un intento de jugar un nivel, controlado por el servidor.
- **Estrellas:** vidas restantes al ganar (1 a 3).
- **Pista:** ayuda progresiva de un desafío que no resta vidas.
- **Teoría de la zona:** video + resumen que se muestra al empezar una zona.
- **Recompensa:** arte, personaje, avatar o plantilla que se desbloquea por reglas.
- **Racha:** días consecutivos jugando.
- **Llamada interna:** pedido REST entre microservicios por `/internal/*` con `x-internal-token`.
