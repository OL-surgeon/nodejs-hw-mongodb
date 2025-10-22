import * as authService from '../services/auth.js';
import { registerUserSchema, loginUserSchema } from '../schemas/authSchemas.js';
import { ctrlWrapper } from '../utils/ctrlWrapper.js';
import createHttpError from 'http-errors';
import { logoutUser } from '../services/auth.js';
import { User } from '../models/user.js';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { Session } from '../models/session.js';
import { getEnvVar } from '../utils/getEnvVar.js';
const JWT_SECRET = getEnvVar('JWT_SECRET');
const APP_DOMAIN = getEnvVar('APP_DOMAIN');
const SMTP_HOST = getEnvVar('SMTP_HOST');
const SMTP_PORT = getEnvVar('SMTP_PORT');
const SMTP_USER = getEnvVar('SMTP_USER');
const SMTP_PASSWORD = getEnvVar('SMTP_PASSWORD');
const SMTP_FROM = getEnvVar('SMTP_FROM');
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
  const { accessToken, refreshToken, sessionId } = await authService.loginUser(
    req.body,
  );

  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
  });
  res.cookie('sessionId', sessionId, {
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
  const { refreshToken, sessionId } = req.cookies;

  if (!refreshToken || !sessionId) {
    throw createHttpError(401, 'Session or refresh token missing');
  }

  const newSession = await authService.refreshSession({
    refreshToken,
    sessionId,
  });

  // Оновлюємо cookies
  res.cookie('refreshToken', newSession.refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'none',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
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
    data: {
      accessToken: newSession.accessToken,
      sessionId: newSession._id,
    },
  });
});
export const sendResetEmailController = ctrlWrapper(async (req, res) => {
  const { email } = req.body;

  // Перевіряємо, чи є користувач
  const user = await User.findOne({ email });
  if (!user) {
    throw createHttpError(404, 'User not found!');
  }

  // Генеруємо JWT токен терміном на 5 хв
  const token = jwt.sign({ email }, JWT_SECRET, { expiresIn: '5m' });

  // Формуємо посилання для фронтенду
  const resetLink = `${APP_DOMAIN}/reset-password?token=${token}`;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT),
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });

  try {
    await transporter.sendMail({
      from: SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html: `<p>Click <a href="${resetLink}">here</a> to reset your password. This link will expire in 5 minutes.</p>`,
    });
  } catch (err) {
    throw createHttpError(
      500,
      'Failed to send the email, please try again later.',
    );
  }

  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
});
export const resetPasswordController = ctrlWrapper(async (req, res) => {
  const { token, password } = req.body;

  let payload;
  try {
    payload = jwt.verify(token, JWT_SECRET);
  } catch (err) {
    throw createHttpError(401, 'Token is expired or invalid.');
  }

  const user = await User.findOne({ email: payload.email });
  if (!user) throw createHttpError(404, 'User not found!');

  // Хешуємо новий пароль
  const hashedPassword = await bcrypt.hash(password, 10);
  user.password = hashedPassword;
  await user.save();

  // Видаляємо всі поточні сесії користувача
  await Session.deleteMany({ userId: user._id });

  res.status(200).json({
    status: 200,
    message: 'Password has been successfully reset.',
    data: {},
  });
});
