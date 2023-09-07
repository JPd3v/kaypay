import { userIdSchema } from '@src/schemas/user.schemas';
import z from 'zod';

const newDepositSchema = z.object({
  body: z.object({
    id: userIdSchema,
    balance: z
      .number()
      .min(1, 'balance should be at least 1')
      .max(100000, 'maximum balance deposit is 100000'),
  }),
});

type NewDepositType = z.infer<typeof newDepositSchema>['body'];

export { newDepositSchema, NewDepositType };
