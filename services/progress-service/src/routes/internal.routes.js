import {
  dateRangeQuerySchema,
  levelCompletionSchema,
  unlockedLevelParamsSchema,
  userIdParamsSchema,
} from '@deventure/contracts';
import { requireInternalToken, validate } from '@deventure/service-kit';
import { Router } from 'express';
import { internalController } from '../controllers/internal.controller.js';

export const internalRouter = Router();

internalRouter.use(requireInternalToken);

internalRouter.get(
  '/users/:userId/unlocked/:levelId',
  validate({ params: unlockedLevelParamsSchema }),
  internalController.getLevelUnlocked,
);
internalRouter.get(
  '/users/:userId/achievements',
  validate({ params: userIdParamsSchema }),
  internalController.getPlayerAchievements,
);
internalRouter.post(
  '/level-completions',
  validate({ body: levelCompletionSchema }),
  internalController.registerLevelCompletion,
);
internalRouter.delete(
  '/users/:userId',
  validate({ params: userIdParamsSchema }),
  internalController.deletePlayerData,
);
internalRouter.get(
  '/stats/completions',
  validate({ query: dateRangeQuerySchema }),
  internalController.getCompletionStats,
);
