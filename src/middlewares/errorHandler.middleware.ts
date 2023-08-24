import AppError from '@src/utils/appError.utils.';
import { NextFunction, Request, Response } from 'express';
import { TokenExpiredError } from 'jsonwebtoken';
import { ZodError } from 'zod';

function errorHandler(
  error: Error,
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  if (error instanceof ZodError) {
    return res.status(400).json(error.issues);
  }

  if (error instanceof TokenExpiredError) {
    return res.status(401).json({ error: 'Unauthorized' });
  }
  if (error instanceof AppError) {
    return res.status(error.httpCode).json({ error: error.message });
  }

  console.log(error);
  return res.status(500).json({ message: 'Internal server error' });
}

export default errorHandler;
