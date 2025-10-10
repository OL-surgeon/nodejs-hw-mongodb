import { Router } from 'express';
import cookieParser from 'cookie-parser';
import { validateBody } from '../middlewares/validateBody.js';
import { registerUserSchema, loginUserSchema } from '../schemas/authSchemas.js';
import * as authController from '../controllers/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

export const authRouter = Router();

authRouter.use(cookieParser());

authRouter.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(authController.registerUser),
);

authRouter.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(authController.loginUser),
);
authRouter.post('/logout', logoutController);
authRouter.post('/refresh', ctrlWrapper(authController.refreshSession));
