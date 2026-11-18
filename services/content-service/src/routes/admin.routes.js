import {
  challengeIdParamsSchema,
  challengePreviewSchema,
  challengeWriteSchema,
  levelCreateSchema,
  levelIdParamsSchema,
  levelOrderSchema,
  levelUpdateSchema,
  zoneCreateSchema,
  zoneIdParamsSchema,
  zoneUpdateSchema,
} from '@deventure/contracts';
import { requireRole, requireUser, validate } from '@deventure/service-kit';
import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';

export const adminRouter = Router();

adminRouter.use(requireUser, requireRole('admin'));

adminRouter.get('/zones', adminController.listZones);
adminRouter.post('/zones', validate({ body: zoneCreateSchema }), adminController.createZone);
adminRouter.patch(
  '/zones/:zoneId',
  validate({ params: zoneIdParamsSchema, body: zoneUpdateSchema }),
  adminController.updateZone,
);
adminRouter.post(
  '/zones/:zoneId/levels',
  validate({ params: zoneIdParamsSchema, body: levelCreateSchema }),
  adminController.createLevel,
);
adminRouter.put(
  '/zones/:zoneId/levels/order',
  validate({ params: zoneIdParamsSchema, body: levelOrderSchema }),
  adminController.reorderLevels,
);
adminRouter.patch(
  '/levels/:levelId',
  validate({ params: levelIdParamsSchema, body: levelUpdateSchema }),
  adminController.updateLevel,
);
adminRouter.get(
  '/levels/:levelId/challenges',
  validate({ params: levelIdParamsSchema }),
  adminController.listLevelChallenges,
);
adminRouter.post(
  '/levels/:levelId/challenges',
  validate({ params: levelIdParamsSchema, body: challengeWriteSchema }),
  adminController.createChallenge,
);
adminRouter.put(
  '/challenges/:challengeId',
  validate({ params: challengeIdParamsSchema, body: challengeWriteSchema }),
  adminController.replaceChallenge,
);
adminRouter.delete(
  '/challenges/:challengeId',
  validate({ params: challengeIdParamsSchema }),
  adminController.deleteChallenge,
);
adminRouter.post(
  '/challenge-previews',
  validate({ body: challengePreviewSchema }),
  adminController.previewChallenge,
);
