import { Router } from 'express';
import {
  logIn,
  logedUserInformation,
  refreshTokens,
  signUp,
} from '../controllers';

const router = Router();

router.post('/sign-up', signUp);
router.post('/log-in', logIn);
router.get('/me', logedUserInformation);
router.get('/refresh-token', refreshTokens);

export default router;
