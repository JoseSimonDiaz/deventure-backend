import {
  changePasswordSchema,
  deleteAccountSchema,
  loginSchema,
  registerSchema,
  updateAvatarSchema,
  updateSettingsSchema,
  updateUsernameSchema,
} from '@deventure/contracts';
import { requireUser, validate } from '@deventure/service-kit';
import { Router } from 'express';
import { accountController } from '../controllers/account.controller.js';
import { authController } from '../controllers/auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', validate({ body: registerSchema }), authController.register);
authRouter.post('/login', validate({ body: loginSchema }), authController.login);

authRouter.get('/me', requireUser, authController.me);
authRouter.patch(
  '/me',
  requireUser,
  validate({ body: updateUsernameSchema }),
  accountController.updateUsername,
);
authRouter.delete(
  '/me',
  requireUser,
  validate({ body: deleteAccountSchema }),
  accountController.deleteAccount,
);
authRouter.patch('/me/intro-seen', requireUser, authController.markIntroSeen);
authRouter.get('/me/settings', requireUser, accountController.getSettings);
authRouter.patch(
  '/me/settings',
  requireUser,
  validate({ body: updateSettingsSchema }),
  accountController.updateSettings,
);
authRouter.patch(
  '/me/password',
  requireUser,
  validate({ body: changePasswordSchema }),
  accountController.changePassword,
);
authRouter.patch(
  '/me/avatar',
  requireUser,
  validate({ body: updateAvatarSchema }),
  accountController.updateAvatar,
);
