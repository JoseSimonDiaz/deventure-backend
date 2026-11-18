import { z } from 'zod';
import { idSchema } from './common.js';

export const REWARD_TYPES = Object.freeze(['art', 'character', 'avatar', 'template']);
export const REWARD_RARITIES = Object.freeze(['common', 'rare', 'epic']);
export const REWARD_STATUSES = Object.freeze(['unlocked', 'locked']);

export const rewardsQuerySchema = z.object({
  type: z.enum(REWARD_TYPES).optional(),
  status: z.enum(REWARD_STATUSES).optional(),
});

export const rewardIdParamsSchema = z.object({ rewardId: idSchema });

export const userRewardParamsSchema = z.object({ userId: idSchema, rewardId: idSchema });

export const evaluationRequestSchema = z.object({
  sessionId: idSchema,
  userId: idSchema,
});
