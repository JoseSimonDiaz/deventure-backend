import { loginSchema, registerSchema } from '@deventure/contracts';
import { requireUser, validate } from '@deventure/service-kit';
import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';

export const authRouter = Router();

authRouter.post('/register', validate({ body: registerSchema }), authController.register);
authRouter.post('/login', validate({ body: loginSchema }), authController.login);

authRouter.get('/me', requireUser, authController.me);
authRouter.patch('/me/intro-seen', requireUser, authController.markIntroSeen);
