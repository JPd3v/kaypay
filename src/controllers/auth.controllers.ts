import { NextFunction, Request, Response } from 'express';
import { schemaValidation } from '@src/middlewares';
import { SignUpType, signUpSchema } from '@src/schemas';
import {
  addUser,
  hashPassword,
  newAccesToken,
  newRefreshToken,
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

      const hashedPassword = await hashPassword(password);
      const user = await addUser(
        firstName,
        lastName,
        alias,
        email,
        hashedPassword,
      );
      const accessToken = newAccesToken(
        user.rows[0].id,
        firstName,
        lastName,
        alias,
        email,
      );
      const refreshToken = newRefreshToken(user.rows[0].id);
      const responseObject = {
        ...user.rows[0],
        accessToken,
      };

      res.cookie('refreshToken', refreshToken, authCookiesOptions);
      res.status(200).json(responseObject);
    } catch (error) {
      next(error);
    }
  },
];

// eslint-disable-next-line import/prefer-default-export
export { signUp };
