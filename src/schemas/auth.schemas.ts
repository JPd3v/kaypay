import { z } from 'zod';
import { getUserByAlias, getUserByEmail } from '../services';

const signUpSchema = z.object({
  body: z
    .object({
      firstName: z
        .string()
        .nonempty('First name is required')
        .max(20, 'First name max length is 20 characters')
        .trim()
        .toLowerCase(),
      lastName: z
        .string()
        .nonempty('Last name is required')
        .max(20, 'Last name max length is 20 characters')
        .trim()
        .toLowerCase(),
      alias: z
        .string()
        .nonempty('Alias is required')
        .max(30, 'Alias max length is 30 characters')
        .trim()
        .toLowerCase()
        .refine(async (alias) => {
          const isAliasOnUse = await getUserByAlias(alias);
          if (isAliasOnUse.rowCount > 0) return false;
          return true;
        }),
      email: z
        .string()
        .nonempty('Email is required')
        .max(50, 'Email max length is 50 characters')
        .email()
        .trim()
        .toLowerCase()
        .refine(async (email) => {
          const isEmailOnUse = await getUserByEmail(email);
          if (isEmailOnUse.rowCount > 0) return false;
          return true;
        }),
      password: z
        .string()
        .nonempty('Password is required')
        .min(8, 'password min length is 8 characters')
        .max(30, 'Password max length is 30 characters'),
      confirmPassword: z
        .string()
        .nonempty('Password is required')
        .min(8, 'Confirm password min length is 8 characters')
        .max(30, 'Confirm password max length is 30 characters'),
    })
    .refine((data) => data.password === data.confirmPassword, {
      message: "Password and Confirm Password  don't match",
      path: ['password', 'confirmPassword'],
    }),
});

type SignUpType = z.infer<typeof signUpSchema>['body'];
// eslint-disable-next-line import/prefer-default-export
export { signUpSchema, SignUpType };
