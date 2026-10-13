import { levelIdParamsSchema, zoneIdParamsSchema } from '@deventure/contracts';
import { requireUser, validate } from '@deventure/service-kit';
import { Router } from 'express';
import { contentController } from '../controllers/content.controller.js';

export const contentRouter = Router();

contentRouter.use(requireUser);

contentRouter.get('/zones', contentController.listZones);
contentRouter.get(
  '/zones/:zoneId/theory',
  validate({ params: zoneIdParamsSchema }),
  contentController.getZoneTheory,
);
contentRouter.get(
  '/levels/:levelId',
  validate({ params: levelIdParamsSchema }),
  contentController.getLevel,
);
