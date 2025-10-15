import * as authService from '../services/auth.js';
import { registerUserSchema, loginUserSchema } from '../schemas/authSchemas.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import createHttpError from 'http-errors';
import { logoutUser } from '../services/auth.js';

// =======================
// Контролер реєстрації
// =======================
export const registerController = ctrlWrapper(async (req, res) => {
  const { error, value } = registerUserSchema.validate(req.body);
  if (error) {
    throw createHttpError(400, error.details[0].message);
  }

  const user = await authService.registerUser(value);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user, // пароль видаляється автоматично через userSchema.methods.toJSON
  });
});

// =======================
// Контролер логіну
// =======================
export const loginUser = ctrlWrapper(async (req, res) => {
  const { accessToken, refreshToken } = await authService.loginUser(req.body);

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken },
  });
});

// =======================
// Контролер логауту
// =======================
export const logoutController = ctrlWrapper(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token missing');
  }

  await logoutUser(refreshToken);

  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: true,
  });

  res.status(204).send();
});

// =======================
// Контролер оновлення сесії
// =======================
export const refreshSessionController = ctrlWrapper(async (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) {
    throw createHttpError(401, 'Refresh token missing');
  }

  const { accessToken, newRefreshToken } =
    await authService.refreshSession(refreshToken);

  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken },
  });
});
