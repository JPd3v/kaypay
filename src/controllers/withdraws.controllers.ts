import { authValidation, schemaValidation } from '@src/middlewares';
import {
  NewWithdrawType,
  newWithdrawSchema,
} from '@src/schemas/withdraw.schemas';
import { doWithdraw } from '@src/services';
import { NextFunction, Request, Response } from 'express';

const newWithdraw = [
  authValidation,
  schemaValidation(newWithdrawSchema),
  async (
    req: Request<unknown, unknown, NewWithdrawType>,
    res: Response,
    next: NextFunction,
  ) => {
    const { aliasCbu, balance, bankName } = req.body;
    const { id } = req.user;

    try {
      const withdraw = await doWithdraw({
        aliasCbu,
        balance,
        userId: id,
        bank: bankName,
      });

      res.status(200).json(withdraw);
    } catch (error) {
      next(error);
    }
  },
];

// eslint-disable-next-line import/prefer-default-export
export { newWithdraw };
