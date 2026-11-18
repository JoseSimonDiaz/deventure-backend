import { pendingCallsQuerySchema } from '@deventure/contracts';
import { requireRole, requireUser, validate } from '@deventure/service-kit';
import { Router } from 'express';
import { adminController } from '../controllers/admin.controller.js';

export const adminRouter = Router();

adminRouter.use(requireUser, requireRole('admin'));

adminRouter.get(
  '/pending-calls',
  validate({ query: pendingCallsQuerySchema }),
  adminController.listPendingCalls,
);
