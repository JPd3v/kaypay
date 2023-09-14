import { authValidation, schemaValidation } from '@src/middlewares';
import {
  GetUserTransferencesType,
  NewTransferenceType,
  getUserTransferencesSchema,
  newTransferenceSchema,
} from '@src/schemas/transferences.schemas';
import {
  balanceTransference,
  getUserTransferences,
} from '@src/services/transferences.services';
import { NextFunction, Request, Response } from 'express';

const newTransference = [
  authValidation,
  schemaValidation(newTransferenceSchema),
  async (
    req: Request<unknown, unknown, NewTransferenceType, unknown>,
    res: Response,
    next: NextFunction,
  ) => {
    try {
      const { id } = req.user;
      const { balance, toUser } = req.body;
      const transference = await balanceTransference({
        senderId: id,
        alias: toUser,
        balance,
      });

      res.status(200).json({ message: transference });
    } catch (error) {
      next(error);
    }
  },
];

const userTransferences = [
  authValidation,
  schemaValidation(getUserTransferencesSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.user;
      const { currentPage, pageSize } =
        req.query as unknown as GetUserTransferencesType;

      const transferences = await getUserTransferences(
        id,
        currentPage,
        pageSize,
      );

      res.status(200).json(transferences.rows);
    } catch (error) {
      next(error);
    }
  },
];
export { newTransference, userTransferences };
