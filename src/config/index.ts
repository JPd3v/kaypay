import { CookieOptions } from 'express';

const authCookiesOptions: CookieOptions = {
  secure: true,
  httpOnly: true,
  sameSite: 'none',
};

// eslint-disable-next-line import/prefer-default-export
export { authCookiesOptions };
