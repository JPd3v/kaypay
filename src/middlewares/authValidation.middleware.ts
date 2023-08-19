import { verifyAccessToken } from '@src/services';
import { NextFunction, Request, Response } from 'express';

export default async function authValidation(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const { accessToken } = req.cookies;

    if (!accessToken) {
      return res.status(400).json({ error: 'User not logged in' });
    }

    const tokenPayload = verifyAccessToken(accessToken);

    req.user = tokenPayload;

    return next();
  } catch (error) {
    return next(error);
  }
}
