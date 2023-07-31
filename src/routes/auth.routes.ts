import { Router } from 'express';
import { signUp } from '../controllers';

const router = Router();

router.post('/sign-up', signUp);

export default router;
