import { Router } from 'express';
import cookieParser from 'cookie-parser';
import { validateBody } from '../middlewares/validateBody.js';
import { registerUserSchema, loginUserSchema } from '../schemas/authSchemas.js';
import {
  registerController,
  loginUser,
  logoutController,
  refreshSessionController,
} from '../controllers/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { resetEmailSchema } from '../schemas/authSchemas.js';
import { sendResetEmailController } from '../controllers/auth.js';
import { resetPwdSchema } from '../schemas/authSchemas.js';
import { resetPasswordController } from '../controllers/auth.js';
export const authRouter = Router();

// Підключаємо cookieParser для роботи з cookies
authRouter.use(cookieParser());

// =======================
// Роут реєстрації
// POST /auth/register
// =======================
authRouter.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(registerController),
);

// =======================
// Роут логіну
// POST /auth/login
// =======================
authRouter.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginUser),
);

// =======================
// Роут оновлення сесії
// POST /auth/refresh
// =======================
authRouter.post('/refresh', ctrlWrapper(refreshSessionController));

// =======================
// Роут логауту
// POST /auth/logout
// =======================
authRouter.post('/logout', ctrlWrapper(logoutController));
authRouter.post(
  '/send-reset-email',
  validateBody(resetEmailSchema),
  ctrlWrapper(sendResetEmailController),
);
authRouter.post(
  '/reset-pwd',
  validateBody(resetPwdSchema),
  ctrlWrapper(resetPasswordController),
);
