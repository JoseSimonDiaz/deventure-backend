# ADR-002 · Reglas de código

- **Estado:** aceptado
- **Fecha:** 2026-10-12
- **Modifica:** ADR-001 (fila "Calidad" y "tipos documentados con JSDoc")

## Contexto

El equipo trae observaciones de code review de proyectos anteriores (RollingCode Platform,
Student Manager, ipacym, ipaat, Cooperativa) que se repitieron en varios PRs. Se quiere que
Deventure arranque con esas reglas desde el principio y que se cumplan solas, sin depender de que
alguien las recuerde en cada review.

## Decisión

| Tema                    | Decisión                                                                                                                                           |
| ----------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Iteración en el backend | Sin loops ni `map`/`filter`/`some`/`find`/`reduce`/`forEach`/`sort`. Se resuelve en PostgreSQL (`where`, `groupBy`, `$queryRaw`) o con `Map`/`Set` |
| Forma de las respuestas | La arma la consulta (`select`, `$queryRaw`). Sin mappers en JS                                                                                     |
| Nombres                 | Descriptivos; prohibidos los de una letra                                                                                                          |
| Logs                    | Logger de `service-kit` (pino). Prohibido `console`                                                                                                |
| Comentarios y JSDoc     | No se agregan en código nuevo. Los existentes se quitan en un PR de limpieza aparte                                                                |
| Tests                   | No son obligatorios por ahora. Los existentes se mantienen en verde; cada ticket se prueba a mano                                                  |
| Cumplimiento            | Las reglas verificables están en `packages/eslint-config` (`no-restricted-syntax`, `id-length`, `no-console`) y frenan el `pre-commit` y el CI     |

El detalle completo, con ejemplos y origen de cada regla, está en
`.claude/rules/code-review-rules.md`.

## Consecuencias

- La lógica de filtrado y agregación queda en la base, cerca de los datos, y no se trae de más.
- Lógica que no es de datos (por ejemplo, normalizar el código del jugador en los validadores) se
  tiene que expresar con `Map`, expresiones regulares o llamadas explícitas, lo que puede costar
  más en algunos casos. Si una regla bloquea un caso legítimo, se discute y se registra acá, en vez
  de desactivarla con `eslint-disable`.
- Sin tests, el riesgo de regresiones queda cubierto por la prueba manual de cada PR. Conviene
  revisarlo antes de los validadores de desafíos y las reglas de gameplay (vidas, estrellas,
  desbloqueos), que son la lógica más sensible.
- Sin JSDoc, los tipos en el editor salen de los esquemas Zod (`z.infer`) y de los nombres.
