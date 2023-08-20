import { NextFunction, Request, Response } from 'express';
import { authValidation, schemaValidation } from '@src/middlewares';
import { LogInType, SignUpType, logInSchema, signUpSchema } from '@src/schemas';
import {
  addUser,
  compareUserPassword,
  getUserByAlias,
  getUserByEmail,
  hashPassword,
  newAccesToken,
  newRefreshToken,
  updateUser,
} from '@src/services';
import { authCookiesOptions } from '@src/config';
import { transformToProfileUser } from '@src/utils';

const signUp = [
  schemaValidation(signUpSchema),
  async (
    req: Request<unknown, unknown, SignUpType, unknown>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { alias, email, firstName, lastName, password } = req.body;

      const hashedPassword = await hashPassword(password);

      const user = await addUser({
        firstName,
        lastName,
        alias,
        email,
        password: hashedPassword,
      });

      const savedUser = user.rows[0];

      const accessToken = newAccesToken({
        id: savedUser.id,
        firstName,
        lastName,
        alias,
        email,
      });

      const refreshToken = newRefreshToken(user.rows[0].id);

      await updateUser({
        id: savedUser.id,
        refreshToken,
      });

      const responseObject = user.rows[0];

      res.cookie('accessToken', accessToken, authCookiesOptions);
      res.cookie('refreshToken', refreshToken, authCookiesOptions);
      res.status(200).json(responseObject);
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

      const finduser = await getUserByEmail(email);

      if (finduser.rowCount === 0) {
        return res.status(422).json({ error: 'wrong email or password' });
      }

      const user = finduser.rows[0];

      const userPaswordMatch = await compareUserPassword(
        password,
        user.password,
      );

      if (!userPaswordMatch) {
        return res.status(422).json({ error: 'wrong email or password' });
      }
      const accessToken = newAccesToken(user);

      const refreshToken = newRefreshToken(user.id);

      const responseObject = transformToProfileUser(user);

      await updateUser({
        id: user.id,
        refreshToken,
      });

      res.cookie('accessToken', accessToken, authCookiesOptions);
      res.cookie('refreshToken', refreshToken, authCookiesOptions);
      return res.status(200).json(responseObject);
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
      const { alias } = req.user;
      const userInformation = await getUserByAlias(alias);
      if (userInformation.rowCount < 1) {
        return res.status(404).json({ error: 'User not found' });
      }

      const responseObject = transformToProfileUser(userInformation.rows[0]);

      return res.status(200).json(responseObject);
    } catch (error) {
      return next(error);
    }
  },
];

export { signUp, logIn, logedUserInformation };
