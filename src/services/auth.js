import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import createHttpError from 'http-errors';
import { User } from '../models/user.js';
import { Session } from '../models/session.js';

// =======================
// Сервіс реєстрації користувача
// =======================
export const registerUser = async ({ name, email, password }) => {
  const existingUser = await User.findOne({ email });
  if (existingUser) throw createHttpError(409, 'Email in use');

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email, password: hashedPassword });

  // Повертаємо користувача без пароля (toJSON видаляє password)
  return { id: user._id, name: user.name, email: user.email };
};

// =======================
// Сервіс логіну користувача
// =======================
export const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(401, 'Email or password invalid');

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) throw createHttpError(401, 'Email or password invalid');

  // Генеруємо токени
  const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' },
  );

  // Видаляємо старі сесії користувача
  await Session.deleteMany({ userId: user._id });

  // Створюємо нову сесію
  const now = new Date();
  const accessTokenValidUntil = new Date(now.getTime() + 15 * 60 * 1000); // 15 хв
  const refreshTokenValidUntil = new Date(
    now.getTime() + 30 * 24 * 60 * 60 * 1000,
  ); // 30 днів

  await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return { accessToken, refreshToken };
};

// =======================
// Сервіс оновлення сесії
// =======================
export const refreshSession = async (refreshToken) => {
  if (!refreshToken) throw createHttpError(401, 'Refresh token missing');

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw createHttpError(401, 'Invalid refresh token');
  }

  const user = await User.findById(payload.id);
  if (!user) throw createHttpError(401, 'User not found');

  // Видаляємо стару сесію
  await Session.deleteMany({ userId: user._id });

  // Генеруємо нові токени
  const newAccessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
  const newRefreshToken = jwt.sign(
    { id: user._id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '30d' },
  );

  const now = new Date();
  const accessTokenValidUntil = new Date(now.getTime() + 15 * 60 * 1000); // 15 хв
  const refreshTokenValidUntil = new Date(
    now.getTime() + 30 * 24 * 60 * 60 * 1000,
  ); // 30 днів

  // Створюємо нову сесію
  await Session.create({
    userId: user._id,
    accessToken: newAccessToken,
    refreshToken: newRefreshToken,
    accessTokenValidUntil,
    refreshTokenValidUntil,
  });

  return { accessToken: newAccessToken, newRefreshToken };
};

// =======================
// Сервіс логауту користувача
// =======================
export const logoutUser = async (refreshToken) => {
  if (!refreshToken) throw createHttpError(401, 'Refresh token missing');

  let payload;
  try {
    payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
  } catch (err) {
    throw createHttpError(401, 'Invalid refresh token');
  }

  // Видаляємо сесію користувача з цим refreshToken
  await Session.deleteOne({ userId: payload.id, refreshToken });
};
