import { NextFunction, Request, Response } from 'express';
import { schemaValidation } from '../middlewares';
import { SignUpType, signUpSchema } from '../schemas';
import { addUser } from '../services';
import { hashPassword } from '../helpers';

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

      res.status(200).json(user.rows[0]);
    } catch (error) {
      next(error);
    }
  },
];

// eslint-disable-next-line import/prefer-default-export
export { signUp };
