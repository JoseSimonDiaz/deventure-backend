import { theorySeenSchema } from '@deventure/contracts';
import { requireUser, validate } from '@deventure/service-kit';
import { Router } from 'express';
import { progressController } from '../controllers/progress.controller.js';

export const progressRouter = Router();

progressRouter.use(requireUser);

progressRouter.get('/me', progressController.getMyProgress);
progressRouter.get('/me/summary', progressController.getMySummary);
progressRouter.get('/me/theory-seen', progressController.getSeenTheory);
progressRouter.post(
  '/me/theory-seen',
  validate({ body: theorySeenSchema }),
  progressController.markTheorySeen,
);
