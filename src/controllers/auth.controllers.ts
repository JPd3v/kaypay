import { NextFunction, Request, Response } from 'express';
import { authValidation, schemaValidation } from '@src/middlewares';
import { LogInType, SignUpType, logInSchema, signUpSchema } from '@src/schemas';
import {
  getLogedUserProfile,
  getUserById,
  logInUser,
  newAccesToken,
  newRefreshToken,
  signUpUser,
  updateUser,
  verifyRefreshToken,
} from '@src/services';
import { authCookiesOptions } from '@src/config';

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
      return res.status(400).json({ error: 'refresh token missing' });
    }

    const tokenPayload = verifyRefreshToken(refreshToken);

    const foundUser = await getUserById(tokenPayload.id);

    if (foundUser.rowCount < 1) {
      res.clearCookie('refreshToken', authCookiesOptions);
      return res.status(404).json({ error: 'User not found' });
    }

    const user = foundUser.rows[0];

    if (user.refreshToken !== refreshToken) {
      res.clearCookie('refreshToken', authCookiesOptions);
      res.clearCookie('accessToken', authCookiesOptions);
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const updatedRefreshToken = newRefreshToken(user.id);
    const updatedAccessToken = newAccesToken(user);

    await updateUser({ id: user.id, refreshToken: updatedRefreshToken });

    res.cookie('accessToken', updatedAccessToken, authCookiesOptions);
    res.cookie('refreshToken', updatedRefreshToken, authCookiesOptions);
    return res.status(200).json({ message: 'tokens refreshed successfully' });
  } catch (error) {
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
