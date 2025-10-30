import { Router } from 'express';

import { validateBody } from '../middlewares/validateBody.js';
import {
  registerController,
  loginUser,
  logoutController,
  refreshSessionController,
  sendResetEmailController,
  resetPasswordController,
} from '../controllers/auth.js';
import {
  registerUserSchema,
  loginUserSchema,
  resetEmailSchema,
  resetPwdSchema,
} from '../schemas/authSchemas.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

const router = Router();

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
// Роут логауту
// POST /auth/logout
// =======================
authRouter.post('/logout', ctrlWrapper(logoutController));
// =======================
// Роут оновлення сесії
// POST /auth/refresh
// =======================
authRouter.post('/refresh', ctrlWrapper(refreshSessionController));
export default router;
// =======================
// Роути скидання пароля
// =======================
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
