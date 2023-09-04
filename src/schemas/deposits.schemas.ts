import { getUserById } from '@src/services';
import z from 'zod';

const newDepositSchema = z.object({
  body: z.object({
    id: z
      .number()
      .min(1, "user id can't be lower than 1 ")
      .refine(async (id) => {
        const findUser = await getUserById(id);

        if (findUser.rowCount > 0) return true;

        return false;
      }, "User doesn't exists"),
    balance: z
      .number()
      .min(1, 'balance should be at least 1')
      .max(100000, 'maximum balance deposit is 100000'),
  }),
});

type NewDepositType = z.infer<typeof newDepositSchema>['body'];

// eslint-disable-next-line import/prefer-default-export
export { newDepositSchema, NewDepositType };
