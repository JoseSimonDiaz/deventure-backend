import {
  dateRangeQuerySchema,
  sessionIdParamsSchema,
  userIdParamsSchema,
  validatePreviewSchema,
} from '@deventure/contracts';
import { requireInternalToken, validate } from '@deventure/service-kit';
import { Router } from 'express';
import { internalController } from '../controllers/internal.controller.js';

export const internalRouter = Router();

internalRouter.use(requireInternalToken);

internalRouter.get(
  '/sessions/:sessionId',
  validate({ params: sessionIdParamsSchema }),
  internalController.getSession,
);
internalRouter.post(
  '/validations',
  validate({ body: validatePreviewSchema }),
  internalController.validateAnswer,
);
internalRouter.delete(
  '/users/:userId',
  validate({ params: userIdParamsSchema }),
  internalController.deleteUserData,
);
internalRouter.get(
  '/stats/levels',
  validate({ query: dateRangeQuerySchema }),
  internalController.getLevelStats,
);
