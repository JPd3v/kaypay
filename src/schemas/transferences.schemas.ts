import { userAliasSchema } from '@src/schemas/user.schemas';
import z from 'zod';

const balanceSchema = z
  .number()
  .min(1, 'balance should be at least 1')
  .max(100000, 'maximum balance transference is 100000');

const newTransferenceSchema = z.object({
  body: z.object({ toUser: userAliasSchema, balance: balanceSchema }),
});

type NewTransferenceType = z.infer<typeof newTransferenceSchema>['body'];
// eslint-disable-next-line import/prefer-default-export
export { newTransferenceSchema, NewTransferenceType };
