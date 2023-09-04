import { newDeposit } from '@src/controllers';
import { Router } from 'express';

const router = Router();

router.post('/', newDeposit);

export default router;
