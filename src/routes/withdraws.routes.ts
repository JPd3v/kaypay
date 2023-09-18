import { newWithdraw } from '@src/controllers/withdraws.controllers';
import { Router } from 'express';

const router = Router();

router.post('/', newWithdraw);

export default router;
