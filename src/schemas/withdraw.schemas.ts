import z from 'zod';

const newWithdrawSchema = z.object({
  body: z.object({
    balance: z.number().min(1, 'Minimum withdraw balance should be at least 1'),
    aliasCbu: z
      .string()
      .min(6, 'Alias cbu should have a minimum of 6 characters')
      .max(20, 'Alias cbu should have a maximum of 20 characters'),
    bankName: z
      .string()
      .max(50, 'Bank name should have a maximum of 50 characters')
      .nonempty("Bank name can't be empty"),
  }),
});

type NewWithdrawType = z.infer<typeof newWithdrawSchema>['body'];

export { newWithdrawSchema, NewWithdrawType };
