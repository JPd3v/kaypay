import { userAliasSchema } from '@src/schemas/user.schemas';
import z from 'zod';

const balanceSchema = z
  .number()
  .min(1, 'balance should be at least 1')
  .max(100000, 'maximum balance transference is 100000');

const newTransferenceSchema = z.object({
  body: z.object({
    toUser: userAliasSchema,
    balance: balanceSchema,
  }),
});

const getUserTransferencesSchema = z.object({
  query: z.object({
    currentPage: z.coerce.number().min(0, 'page should be at least 0'),
    pageSize: z.coerce
      .number()
      .min(0, 'page size should be at least 1')
      .max(50, 'maximum page size is 50'),
  }),
});

type NewTransferenceType = z.infer<typeof newTransferenceSchema>['body'];
type GetUserTransferencesType = z.infer<
  typeof getUserTransferencesSchema
>['query'];

export {
  newTransferenceSchema,
  NewTransferenceType,
  getUserTransferencesSchema,
  GetUserTransferencesType,
};
