/* eslint-disable no-eval */
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { pool, queries } from '../database/index';

async function addUser(
  firstName: string,
  lastName: string,
  alias: string,
  email: string,
  password: string,
) {
  const createUser = await pool.query(queries.auth.addUser, [
    firstName,
    lastName,
    alias,
    email,
    password,
  ]);

  return createUser;
}
function logUser() {}

async function hashPassword(password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);

  return hashedPassword;
}

function newAccesToken(
  id: string,
  firstName: string,
  lastName: string,
  alias: string,
  email: string,
) {
  return jwt.sign(
    { id, firstName, lastName, alias, email },
    process.env.ACCESS_TOKEN_SECRET as string,
    { expiresIn: eval(process.env.ACCESS_TOKEN_EXPIRATION as string) },
  );
}

function newRefreshToken(id: string) {
  return jwt.sign({ id }, process.env.ACCESS_TOKEN_SECRET as string, {
    expiresIn: eval(process.env.REFRESH_TOKEN_EXPIRATION as string),
  });
}

export { addUser, logUser, newAccesToken, newRefreshToken, hashPassword };
