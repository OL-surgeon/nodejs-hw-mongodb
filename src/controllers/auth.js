import {
  registerUser,
  loginUser,
  logoutUser,
  refreshUsersSession,
  sendResetToken,
  resetPassword,
} from '../services/auth.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';
import createHttpError from 'http-errors';
import { getEnvVar } from '../utils/getEnvVar.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = getEnvVar('JWT_SECRET');
const APP_DOMAIN = getEnvVar('APP_DOMAIN');

// =======================
// Контролер реєстрації
// =======================
export const registerController = ctrlWrapper(async (req, res) => {
  const user = await registerUser(req.body);

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
});

// =======================
// Контролер логіну
// =======================
export const loginUserController = ctrlWrapper(async (req, res) => {
  const session = await loginUser(req.body);

  res.cookie('refreshToken', session.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.cookie('sessionId', session._id.toString(), {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: { accessToken: session.accessToken },
  });
});

// =======================
// Контролер логауту
// =======================
export const logoutController = ctrlWrapper(async (req, res) => {
  if (!req.cookies.refreshToken) {
    throw createHttpError(401, 'Refresh token missing');
  }

  await logoutUser(req.cookies.refreshToken);

  res.clearCookie('refreshToken', { httpOnly: true, secure: true });
  res.clearCookie('sessionId', { httpOnly: true, secure: true });

  res.status(204).send();
});

// =======================
// Контролер оновлення сесії
// =======================
export const refreshSessionController = ctrlWrapper(async (req, res) => {
  const { refreshToken, sessionId } = req.cookies;

  if (!refreshToken || !sessionId) {
    throw createHttpError(401, 'Session or refresh token missing');
  }

  const newSession = await refreshUsersSession({ refreshToken, sessionId });

  res.cookie('refreshToken', newSession.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.cookie('sessionId', newSession._id.toString(), {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: { accessToken: newSession.accessToken, sessionId: newSession._id },
  });
});

// =======================
// Контролер відправки листа для скидання пароля
// =======================
export const sendResetEmailController = ctrlWrapper(async (req, res) => {
  await sendResetToken(req.body.email);

  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
});

// =======================
// Контролер скидання пароля
// =======================
export const resetPasswordController = ctrlWrapper(async (req, res) => {
  await resetPassword(req.body);

  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
});
