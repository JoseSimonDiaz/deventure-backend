import { existsSync } from 'node:fs';

export function loadEnvFile(path = '.env') {
  if (existsSync(path)) process.loadEnvFile(path);
}

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
