import { rewardIdParamsSchema, rewardsQuerySchema } from '@deventure/contracts';
import { requireUser, validate } from '@deventure/service-kit';
import { Router } from 'express';
import { rewardsController } from '../controllers/rewards.controller.js';

export const rewardsRouter = Router();

rewardsRouter.use(requireUser);

rewardsRouter.get('/me', validate({ query: rewardsQuerySchema }), rewardsController.getMyGallery);
rewardsRouter.patch(
  '/me/:rewardId/seen',
  validate({ params: rewardIdParamsSchema }),
  rewardsController.markSeen,
);
