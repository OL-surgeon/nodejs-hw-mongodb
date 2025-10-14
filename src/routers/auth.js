import { Router } from 'express';
import cookieParser from 'cookie-parser';
import { validateBody } from '../middlewares/validateBody.js';
import { registerUserSchema, loginUserSchema } from '../schemas/authSchemas.js';
import {
  registerController,
  loginUser,
  logoutController,
} from '../controllers/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';

export const authRouter = Router();

authRouter.use(cookieParser());

authRouter.post(
  '/register',
  validateBody(registerUserSchema),
  ctrlWrapper(registerController),
);

authRouter.post(
  '/login',
  validateBody(loginUserSchema),
  ctrlWrapper(loginUser),
);

authRouter.post('/logout', ctrlWrapper(logoutController));
