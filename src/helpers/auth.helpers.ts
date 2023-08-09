/* eslint-disable no-eval */
import { CookieOptions } from 'express';
import jwt from 'jsonwebtoken';

const isOnProduction = process.env.NODE_ENV === 'production';

const authCookiesOptions: CookieOptions = {
  secure: isOnProduction,
  httpOnly: true,
  sameSite: 'none',
};

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

export { newAccesToken, newRefreshToken, authCookiesOptions };
