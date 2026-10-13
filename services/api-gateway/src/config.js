import { loadConfig } from '@deventure/service-kit';
import { z } from 'zod';

export const gatewayConfigSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET tiene que tener al menos 32 caracteres'),
  CORS_ORIGIN: z
    .string()
    .default('http://localhost:5173')
    .transform((originList) => originList.trim().split(/\s*,\s*/)),
  AUTH_URL: z.string().url().default('http://localhost:3001'),
  CONTENT_URL: z.string().url().default('http://localhost:3002'),
  GAMEPLAY_URL: z.string().url().default('http://localhost:3003'),
  PROGRESS_URL: z.string().url().default('http://localhost:3004'),
  REWARDS_URL: z.string().url().default('http://localhost:3005'),
  RATE_LIMIT_AUTH_MAX: z.coerce.number().int().positive().default(10),
  RATE_LIMIT_GLOBAL_MAX: z.coerce.number().int().positive().default(300),
  PROXY_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
});

/** @typedef {z.infer<typeof gatewayConfigSchema>} GatewayConfig */

/** @param {Record<string, string | undefined>} [env] por defecto process.env + .env local */
export const loadGatewayConfig = (env) => loadConfig(gatewayConfigSchema, env);
