import { AccessTokenPayload } from '@src/types';

export {};

declare global {
  namespace Express {
    export interface Request {
      user: AccessTokenPayload;
    }
  }
}
