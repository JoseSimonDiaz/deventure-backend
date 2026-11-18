import {
  evaluationRequestSchema,
  userIdParamsSchema,
  userRewardParamsSchema,
} from '@deventure/contracts';
import { requireInternalToken, validate } from '@deventure/service-kit';
import { Router } from 'express';
import { internalController } from '../controllers/internal.controller.js';

export const internalRouter = Router();

internalRouter.use(requireInternalToken);

internalRouter.post(
  '/evaluations',
  validate({ body: evaluationRequestSchema }),
  internalController.evaluateRewards,
);
internalRouter.get(
  '/users/:userId/rewards/:rewardId',
  validate({ params: userRewardParamsSchema }),
  internalController.getOwnedReward,
);
internalRouter.delete(
  '/users/:userId',
  validate({ params: userIdParamsSchema }),
  internalController.deletePlayerData,
);
