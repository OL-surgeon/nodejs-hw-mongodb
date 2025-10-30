import { randomBytes } from 'crypto';
import bcrypt from 'bcrypt';
import createHttpError from 'http-errors';
import { User } from '../db/models/user.js';
import { Session } from '../db/models/session.js';
import {
  FIFTEEN_MINUTES,
  ONE_DAY,
  TEMPLATES_DIR,
  SMTP,
} from '../constants/index.js';
import { getEnvVar } from '../utils/getEnvVar.js';
import { sendEmail } from '../utils/sendMail.js';
import jwt from 'jsonwebtoken';
import fs from 'node:fs/promises';
import path from 'node:path';
import handlebars from 'handlebars';

// --- Реєстрація користувача ---
export const registerUser = async (payload) => {
  const user = await User.findOne({ email: payload.email });
  if (user) throw createHttpError(409, 'Email in use');

  const encryptedPassword = await bcrypt.hash(payload.password, 10);
  return await User.create({
    ...payload,
    password: encryptedPassword,
  });
};

// --- Логін користувача ---
export const loginUser = async (payload) => {
  const user = await UsersCollection.findOne({ email: payload.email });
  if (!user) {
    throw createHttpError(401, 'User not found');
  }
  const isEqual = await bcrypt.compare(payload.password, user.password);

  if (!isEqual) {
    throw createHttpError(401, 'Unauthorized');
  }
  await SessionsCollection.deleteOne({ userId: user._id });
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return await SessionsCollection.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  });
};

// --- Вихід користувача ---
export const logoutUser = async (sessionId) => {
  await Session.deleteOne({ _id: sessionId });
};

// --- Створення нової сесії ---
const createSession = () => {
  const accessToken = randomBytes(30).toString('base64');
  const refreshToken = randomBytes(30).toString('base64');

  return {
    accessToken,
    refreshToken,
    accessTokenValidUntil: new Date(Date.now() + FIFTEEN_MINUTES),
    refreshTokenValidUntil: new Date(Date.now() + ONE_DAY),
  };
};

// --- Оновлення сесії користувача ---
export const refreshUsersSession = async ({ sessionId, refreshToken }) => {
  const session = await Session.findOne({ _id: sessionId, refreshToken });
  if (!session) throw createHttpError(401, 'Session not found');

  const isExpired = new Date() > new Date(session.refreshTokenValidUntil);
  if (isExpired) throw createHttpError(401, 'Session token expired');

  const newSession = createSession();
  await Session.deleteOne({ _id: sessionId });

  return await Session.create({
    userId: session.userId,
    ...newSession,
  });
};

// --- Відправка листа для скидання паролю ---
export const sendResetToken = async (email) => {
  const user = await User.findOne({ email });
  if (!user) throw createHttpError(404, 'User not found');

  const resetToken = jwt.sign(
    { sub: user._id, email },
    getEnvVar('JWT_SECRET'),
    { expiresIn: '5m' },
  );

  const templatePath = path.join(TEMPLATES_DIR, 'reset-password-email.html');
  const templateSource = (await fs.readFile(templatePath)).toString();
  const template = handlebars.compile(templateSource);

  const html = template({
    name: user.name,
    link: `${getEnvVar('APP_DOMAIN')}/reset-password?token=${resetToken}`,
  });

  await sendEmail({
    from: getEnvVar(SMTP.SMTP_FROM),
    to: email,
    subject: 'Reset your password',
    html,
  });
};

// --- Скидання паролю ---
export const resetPassword = async ({ token, password }) => {
  let decoded;
  try {
    decoded = jwt.verify(token, getEnvVar('JWT_SECRET'));
  } catch (err) {
    if (err instanceof Error)
      throw createHttpError(401, 'Token is expired or invalid.');
    throw err;
  }

  const user = await User.findOne({
    email: entries.email,
    _id: entries.sub,
  });
  if (!user) throw createHttpError(404, 'User not found');

  const hashedPassword = await bcrypt.hash(password, 10);
  await User.updateOne({ _id: user._id }, { password: hashedPassword });
};
