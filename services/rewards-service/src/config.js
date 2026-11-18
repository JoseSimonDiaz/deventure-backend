import { loadConfig } from '@deventure/service-kit';
import { z } from 'zod';

export const config = loadConfig(
  z.object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
    PORT: z.coerce.number().int().positive().default(3005),
    DATABASE_URL: z.string().url(),
    INTERNAL_TOKEN: z.string().min(1, 'INTERNAL_TOKEN es obligatorio para las rutas /internal'),
    CONTENT_URL: z.string().url().default('http://localhost:3002'),
    PROGRESS_URL: z.string().url().default('http://localhost:3004'),
  }),
);
