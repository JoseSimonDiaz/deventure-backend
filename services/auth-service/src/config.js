import { loadConfig } from '@deventure/service-kit';
import { z } from 'zod';

export const config = loadConfig(
  z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3001),
    DATABASE_URL: z.string().url(),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET tiene que tener al menos 32 caracteres'),
    JWT_EXPIRES_IN: z.string().default('24h'),
    BCRYPT_ROUNDS: z.coerce.number().int().min(4).max(14).default(10),
  }),
);
