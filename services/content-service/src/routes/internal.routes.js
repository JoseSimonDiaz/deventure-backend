import { challengeIdParamsSchema, levelIdParamsSchema } from '@deventure/contracts';
import { requireInternalToken, validate } from '@deventure/service-kit';
import { Router } from 'express';
import { internalController } from '../controllers/internal.controller.js';

export const internalRouter = Router();

internalRouter.use(requireInternalToken);

internalRouter.get(
  '/levels/:levelId/summary',
  validate({ params: levelIdParamsSchema }),
  internalController.getLevelSummary,
);
internalRouter.get(
  '/challenges/:challengeId',
  validate({ params: challengeIdParamsSchema }),
  internalController.getChallenge,
);
