# @deventure/contracts

Esquemas Zod compartidos entre frontend y backend. Si un endpoint recibe o devuelve datos, su
esquema vive acá y se reutiliza en `validate(...)` (backend) y en `zodResolver(...)` (frontend).

```js
import { registerSchema, loginSchema, userPublicSchema } from '@deventure/contracts';
```

| Archivo       | Esquemas                                                                                                        |
| ------------- | --------------------------------------------------------------------------------------------------------------- |
| `common.js`   | `idSchema`, `paginationSchema`, `errorResponseSchema`, `dataResponse()`                                         |
| `auth.js`     | `registerSchema`, `loginSchema`, `userPublicSchema`, `authResponseSchema`, `jwtPayloadSchema`, `settingsSchema` |
| `fixtures.js` | `SEED_USER_IDS` (ids fijos de admin y demo para los seeds)                                                      |

Los esquemas de content, gameplay, progress y rewards se agregan con cada servicio.
