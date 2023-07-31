import { NextFunction, Request, Response } from 'express';
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
  console.log(error);
  return res.status(500).json({ message: 'Internal server error' });
}

export default errorHandler;
