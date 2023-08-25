/* eslint-disable no-eval */
import jwt from 'jsonwebtoken';
import { AccessTokenPayload, RefreshTokenPayload, User } from '@src/types';
import bcrypt from 'bcryptjs';
import { SignUpType } from '@src/schemas';
// import { pool, queries } from '../database/index';
import AppError from '@src/utils/appError.utils.';
import { transformToProfileUser } from '@src/utils';
import { addUser, getUserByEmail, updateUser } from './users.services';

async function hashPassword(password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return hashedPassword;
}

function newAccesToken({
  alias,
  email,
  firstName,
  id,
  lastName,
}: Omit<User, 'password' | 'refreshToken' | 'balance'>) {
  return jwt.sign(
    { id, firstName, lastName, alias, email },
    process.env.TOKEN_SECRET as string,
    { expiresIn: eval(process.env.ACCESS_TOKEN_EXPIRATION as string) },
  );
}

function newRefreshToken(id: number) {
  return jwt.sign({ id }, process.env.TOKEN_SECRET as string, {
    expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRATION as string),
  });
}

async function signUpUser({
  firstName,
  lastName,
  alias,
  email,
  password,
}: Omit<SignUpType, 'confirmPassword'>) {
  const hashedPassword = await hashPassword(password);

  const createUser = await addUser({
    alias,
    email,
    firstName,
    lastName,
    password: hashedPassword,
  });

  const user = createUser.rows[0];

  const accessToken = newAccesToken({
    id: user.id,
    firstName,
    lastName,
    alias,
    email,
  });

  const refreshToken = newRefreshToken(user.id);

  await updateUser({
    id: user.id,
    refreshToken,
  });

  const userProfileInformation = transformToProfileUser(user);

  return { userProfileInformation, accessToken, refreshToken };
}

async function compareUserPassword(
  stringPassword: string,
  hashedPassword: string,
) {
  const passwordsAreEqual = await bcrypt.compare(
    stringPassword,
    hashedPassword,
  );
  return passwordsAreEqual;
}

function verifyAccessToken(token: string) {
  const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET as string);
  return verifiedToken as AccessTokenPayload;
}

function verifyRefreshToken(token: string) {
  const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET as string);
  return verifiedToken as RefreshTokenPayload;
}

async function logInUser({
  email,
  password,
}: Pick<User, 'email' | 'password'>) {
  const finduser = await getUserByEmail(email);

  if (finduser.rowCount === 0) {
    throw new AppError('user not found', 422, 'wrong email or password');
  }

  const user = finduser.rows[0];

  const userPaswordMatch = await compareUserPassword(password, user.password);

  if (!userPaswordMatch) {
    throw new AppError("password don't match", 422, 'wrong email or password');
  }

  const accessToken = newAccesToken(user);
  const refreshToken = newRefreshToken(user.id);
  const userProfileInformation = transformToProfileUser(user);

  await updateUser({
    id: user.id,
    refreshToken,
  });

  return { userProfileInformation, accessToken, refreshToken };
}

export {
  signUpUser,
  logInUser,
  newAccesToken,
  newRefreshToken,
  compareUserPassword,
  verifyAccessToken,
  verifyRefreshToken,
};
