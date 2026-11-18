import { dateRangeQuerySchema, userIdParamsSchema } from '@deventure/contracts';
import { requireInternalToken, validate } from '@deventure/service-kit';
import { Router } from 'express';
import { internalController } from '../controllers/internal.controller.js';

export const internalRouter = Router();

internalRouter.use(requireInternalToken);

internalRouter.get(
  '/stats/users',
  validate({ query: dateRangeQuerySchema }),
  internalController.getUserStats,
);
internalRouter.get(
  '/users/:userId/session',
  validate({ params: userIdParamsSchema }),
  internalController.getSessionVersion,
);
