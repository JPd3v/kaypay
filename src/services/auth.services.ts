/* eslint-disable no-eval */
import jwt from 'jsonwebtoken';
import { AccessTokenPayload, User } from '@src/types';
import bcrypt from 'bcryptjs';
import { SignUpType } from '@src/schemas';
import { pool, queries } from '../database/index';

async function addUser({
  firstName,
  lastName,
  alias,
  email,
  password,
}: Omit<SignUpType, 'confirmPassword'>) {
  const createUser = await pool.query<User>(queries.auth.addUser, [
    firstName,
    lastName,
    alias,
    email,
    password,
  ]);

  return createUser;
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

function verifyAccessToken(token: string) {
  const verifiedToken = jwt.verify(token, process.env.TOKEN_SECRET as string);
  return verifiedToken as AccessTokenPayload;
}

export {
  addUser,
  newAccesToken,
  newRefreshToken,
  hashPassword,
  compareUserPassword,
  verifyAccessToken,
};
