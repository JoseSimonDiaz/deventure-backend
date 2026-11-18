import { z } from 'zod';
import { idSchema } from './common.js';

export const MAX_STARS_PER_LEVEL = 3;

export const userIdParamsSchema = z.object({ userId: idSchema });

export const unlockedLevelParamsSchema = z.object({ userId: idSchema, levelId: idSchema });

export const levelCompletionSchema = z.object({
  sessionId: idSchema,
  userId: idSchema,
  levelId: idSchema,
  zoneId: idSchema,
  stars: z.number().int().min(1).max(MAX_STARS_PER_LEVEL),
  livesLeft: z.number().int().min(1),
  hintsUsed: z.number().int().min(0),
  durationMs: z.number().int().positive(),
  completedAt: z.string().datetime(),
});

export const theorySeenSchema = z.object({ zoneId: idSchema });

export const dateRangeQuerySchema = z.object({
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
});
