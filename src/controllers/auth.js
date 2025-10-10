import * as authService from '../services/auth.js';
import { registerUserSchema } from '../validations/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import createHttpError from 'http-errors';
import { logoutUser } from '../services/auth.js';

export const registerController = ctrlWrapper(async (req, res) => {
  const { error, value } = registerUserSchema.validate(req.body);
  if (error) {
    throw createHttpError(400, error.details[0].message);
  }

  const user = await authService.registerUser(value);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
});

export const loginUser = ctrlWrapper(async (req, res) => {
  const { accessToken, refreshToken } = await authService.loginUser(req.body);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken },
  });
});
export const logoutController = ctrlWrapper(async (req, res) => {
  const { refreshToken } = req.cookies;

  await logoutUser(refreshToken);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
  });

  res.status(204).send();
});
