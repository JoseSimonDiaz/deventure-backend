import { existsSync } from 'node:fs';

/**
 * Carga el archivo `.env` de la carpeta actual (si existe) en `process.env`.
 * Las variables que ya estaban definidas (Docker, CI, tests) NO se pisan.
 * @param {string} [path]
 */
export function loadEnvFile(path = '.env') {
  if (existsSync(path)) process.loadEnvFile(path);
}

/**
 * Valida variables de entorno con un esquema Zod. Si falta o está mal alguna, corta el arranque
 * con un mensaje claro (mejor fallar al iniciar que en medio de un request).
 *
 * @template {import('zod').ZodTypeAny} T
 * @param {T} schema ej. `z.object({ PORT: z.coerce.number(), DATABASE_URL: z.string().url() })`
 * @param {Record<string, string | undefined>} [env] por defecto `process.env` (+ el `.env` local)
 * @returns {import('zod').infer<T>}
 */
export function loadConfig(schema, env) {
  if (!env) {
    loadEnvFile();
    env = process.env;
  }
  const result = schema.safeParse(env);
  if (!result.success) {
    const problemsByVariable = JSON.stringify(result.error.flatten().fieldErrors, null, 2);
    throw new Error(`Configuración inválida. Revisá tu archivo .env:\n${problemsByVariable}`);
  }
  return result.data;
}
