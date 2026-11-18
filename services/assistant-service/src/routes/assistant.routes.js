import {
  assistantQuestionSchema,
  oracleQuestionSchema,
  userIdParamsSchema,
} from '@deventure/contracts';
import { requireInternalToken, requireUser, validate } from '@deventure/service-kit';
import { Router } from 'express';
import { assistantController } from '../controllers/assistant.controller.js';

export const assistantRouter = Router();

assistantRouter.post(
  '/hints',
  requireUser,
  validate({ body: assistantQuestionSchema }),
  assistantController.askAssistant,
);

assistantRouter.post(
  '/oracle-questions',
  requireUser,
  validate({ body: oracleQuestionSchema }),
  assistantController.askOracle,
);

export const internalRouter = Router();

internalRouter.delete(
  '/users/:userId',
  requireInternalToken,
  validate({ params: userIdParamsSchema }),
  assistantController.deleteUserData,
);
