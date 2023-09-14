import { newTransference, userTransferences } from '@src/controllers';
import { Router } from 'express';

const router = Router();

router.post('/', newTransference);
router.get('/me', userTransferences);

export default router;
