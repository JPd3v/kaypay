import { NextFunction, Request, Response } from 'express';
import { authValidation, schemaValidation } from '@src/middlewares';
import { LogInType, SignUpType, logInSchema, signUpSchema } from '@src/schemas';
import {
  getLogedUserProfile,
  logInUser,
  refreshUserTokens,
  signUpUser,
  updateUser,
} from '@src/services';
import { authCookiesOptions } from '@src/config';
import AppError from '@src/utils/appError.utils.';

const signUp = [
  schemaValidation(signUpSchema),
  async (
    req: Request<unknown, unknown, SignUpType, unknown>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { alias, email, firstName, lastName, password } = req.body;

      const { userProfileInformation, accessToken, refreshToken } =
        await signUpUser({
          firstName,
          lastName,
          alias,
          email,
          password,
        });

      res.cookie('accessToken', accessToken, authCookiesOptions);
      res.cookie('refreshToken', refreshToken, authCookiesOptions);
      res.status(200).json(userProfileInformation);
    } catch (error) {
      next(error);
    }
  },
];

const logIn = [
  schemaValidation(logInSchema),
  async (
    req: Request<unknown, unknown, LogInType, unknown>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { email, password } = req.body;

      const { userProfileInformation, accessToken, refreshToken } =
        await logInUser({ email, password });

      res.cookie('accessToken', accessToken, authCookiesOptions);
      res.cookie('refreshToken', refreshToken, authCookiesOptions);
      return res.status(200).json(userProfileInformation);
    } catch (error) {
      return next(error);
    }
  },
];

const logedUserInformation = [
  authValidation,
  async (
    req: Request<unknown, unknown, LogInType, unknown>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.user;

      const userInformation = await getLogedUserProfile(id);

      return res.status(200).json(userInformation);
    } catch (error) {
      return next(error);
    }
  },
];

const refreshTokens = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.cookies;

    if (!refreshToken) {
      throw new AppError('refresh token missing', 400, 'user not logged in');
    }

    const { updatedAccessToken, updatedRefreshToken } = await refreshUserTokens(
      refreshToken,
    );

    res.cookie('accessToken', updatedAccessToken, authCookiesOptions);
    res.cookie('refreshToken', updatedRefreshToken, authCookiesOptions);

    return res.status(200).json({ message: 'tokens refreshed successfully' });
  } catch (error) {
    if (error instanceof AppError) {
      res.clearCookie('refreshToken', authCookiesOptions);
      res.clearCookie('accessToken', authCookiesOptions);
    }
    return next(error);
  }
};

const logOut = [
  authValidation,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.user;
      await updateUser({ id, refreshToken: '' });

      res.clearCookie('refreshToken', authCookiesOptions);
      res.clearCookie('accessToken', authCookiesOptions);
      return res.status(200).json({ message: 'log out successfully' });
    } catch (error) {
      return next(error);
    }
  },
];

export { signUp, logIn, logedUserInformation, refreshTokens, logOut };
