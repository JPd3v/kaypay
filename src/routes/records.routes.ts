import { userRecords } from '@src/controllers';
import { Router } from 'express';

const router = Router();

router.get('/', userRecords);

export default router;
