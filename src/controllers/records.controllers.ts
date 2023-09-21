import { NextFunction, Request, Response } from 'express';
import { authValidation, schemaValidation } from '@src/middlewares';
import { GetRecordsTypes, getRecordsSchema } from '@src/schemas';

import { getUserRecords } from '@src/services';

const userRecords = [
  authValidation,
  schemaValidation(getRecordsSchema),
  async (req: Request, res: Response, next: NextFunction) => {
    const { currentPage, pageSize } = req.query as unknown as GetRecordsTypes;
    const { id } = req.user;
    try {
      const records = await getUserRecords({
        userId: id,
        page: currentPage,
        limit: pageSize,
      });

      res.status(200).json(records);
    } catch (error) {
      next(error);
    }
  },
];

// eslint-disable-next-line import/prefer-default-export
export { userRecords };
