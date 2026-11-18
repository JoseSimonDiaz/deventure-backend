import {
  attemptRequestSchema,
  hintRequestSchema,
  sessionIdParamsSchema,
  startSessionSchema,
  updateSessionSchema,
} from '@deventure/contracts';
import { requireUser, validate } from '@deventure/service-kit';
import { Router } from 'express';
import { gameplayController } from '../controllers/gameplay.controller.js';

export const gameplayRouter = Router();

gameplayRouter.use(requireUser);

gameplayRouter.post(
  '/sessions',
  validate({ body: startSessionSchema }),
  gameplayController.startSession,
);
gameplayRouter.get(
  '/sessions/:sessionId',
  validate({ params: sessionIdParamsSchema }),
  gameplayController.getSession,
);
gameplayRouter.patch(
  '/sessions/:sessionId',
  validate({ params: sessionIdParamsSchema, body: updateSessionSchema }),
  gameplayController.abandonSession,
);
gameplayRouter.post(
  '/sessions/:sessionId/attempts',
  validate({ params: sessionIdParamsSchema, body: attemptRequestSchema }),
  gameplayController.submitAttempt,
);
gameplayRouter.post(
  '/sessions/:sessionId/hints',
  validate({ params: sessionIdParamsSchema, body: hintRequestSchema }),
  gameplayController.requestHint,
);
