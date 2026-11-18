import { z } from 'zod';
import { idSchema } from './common.js';
import { sessionStatusSchema } from './gameplay.js';
import { REWARD_RARITIES, REWARD_TYPES } from './rewards.js';

export const levelCompletionResultSchema = z.object({
  isNewBest: z.boolean(),
  unlockedLevelIds: z.array(idSchema),
  unlockedZoneId: idSchema.nullable(),
  zoneCompleted: z.boolean(),
  zonePerfect: z.boolean(),
  totalStars: z.number().int().min(0),
});

export const rewardEvaluationSchema = z.object({
  unlocked: z.array(
    z.object({
      id: idSchema,
      name: z.string(),
      type: z.enum(REWARD_TYPES),
      rarity: z.enum(REWARD_RARITIES),
      imageUrl: z.string(),
    }),
  ),
});

export const internalSessionSchema = z.object({
  id: idSchema,
  userId: idSchema,
  levelId: idSchema,
  zoneId: idSchema,
  challengeIds: z.array(idSchema),
  currentIndex: z.number().int().min(0),
  initialLives: z.number().int().positive(),
  livesLeft: z.number().int().min(0),
  hintsUsed: z.number().int().min(0),
  status: sessionStatusSchema,
  startedAt: z.string().datetime(),
  lastAttemptAt: z.string().datetime().nullable(),
});
