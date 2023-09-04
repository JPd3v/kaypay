import { schemaValidation } from '@src/middlewares';
import {
  NewDepositType,
  newDepositSchema,
} from '@src/schemas/deposits.schemas';
import { createUserDeposit } from '@src/services/deposits.services';
import { NextFunction, Request, Response } from 'express';

const newDeposit = [
  schemaValidation(newDepositSchema),
  async (
    req: Request<unknown, unknown, NewDepositType>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { balance, id } = req.body;

      const deposit = await createUserDeposit(id, balance);

      res.status(200).json(deposit.rows[0]);
    } catch (error) {
      next(error);
    }
  },
];

// eslint-disable-next-line import/prefer-default-export
export { newDeposit };
