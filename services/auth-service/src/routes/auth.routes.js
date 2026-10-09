import { loginSchema, registerSchema } from '@deventure/contracts';
import { requireUser, validate } from '@deventure/service-kit';
import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';

export const authRouter = Router();

// En el gateway: POST /api/auth/register y POST /api/auth/login (públicas)
authRouter.post('/register', validate({ body: registerSchema }), authController.register);
authRouter.post('/login', validate({ body: loginSchema }), authController.login);

// En el gateway: GET /api/auth/me (requiere JWT; el gateway manda x-user-id / x-user-role)
authRouter.get('/me', requireUser, authController.me);
