import { Router } from 'express';
import {
  logIn,
  logOut,
  logedUserInformation,
  refreshTokens,
  signUp,
} from '../controllers';

const router = Router();

router.post('/sign-up', signUp);
router.post('/log-in', logIn);
router.get('/me', logedUserInformation);
router.get('/refresh-token', refreshTokens);
router.post('/log-out', logOut);

export default router;
