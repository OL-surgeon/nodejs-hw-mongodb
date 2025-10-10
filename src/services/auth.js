import {
  registerUser,
  loginUser,
  refreshSession,
  logoutUser,
} from '../services/auth.js';
import { registerUserSchema, loginUserSchema } from '../validations/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import createHttpError from 'http-errors';

// ---------------- REGISTER ----------------
export const registerController = ctrlWrapper(async (req, res) => {
  const { error, value } = registerUserSchema.validate(req.body);
  if (error) {
    throw createHttpError(400, error.details[0].message);
  }

  const user = await registerUser(value);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
});

// ---------------- LOGIN ----------------
export const loginController = ctrlWrapper(async (req, res) => {
  const { error, value } = loginUserSchema.validate(req.body);
  if (error) {
    throw createHttpError(400, error.details[0].message);
  }

  const { accessToken, refreshToken } = await loginUser(value);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken },
  });
});

// ---------------- REFRESH ----------------
export const refreshController = ctrlWrapper(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw createHttpError(401, 'Refresh token is missing');

  const { accessToken, newRefreshToken } = await refreshSession(refreshToken);

  // Оновлюємо cookie
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken },
  });
});

// ---------------- LOGOUT ----------------
export const logoutController = ctrlWrapper(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) throw createHttpError(401, 'Refresh token is missing');

  await logoutUser(refreshToken);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
  });

  res.status(204).send(); // без тіла
});
