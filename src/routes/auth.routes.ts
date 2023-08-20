import { Router } from 'express';
import { logIn, logedUserInformation, signUp } from '../controllers';

const router = Router();

router.post('/sign-up', signUp);
router.post('/log-in', logIn);
router.get('/me', logedUserInformation);

export default router;
