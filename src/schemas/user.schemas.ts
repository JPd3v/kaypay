import { getUserByAlias, getUserById } from '@src/services';
import z from 'zod';

const userIdSchema = z
  .number()
  .min(1, "user id can't be lower than 1 ")
  .refine(async (id) => {
    const findUser = await getUserById(id);

    if (findUser.rowCount > 0) return true;

    return false;
  }, "User doesn't exists");

const userAliasSchema = z
  .string()
  .nonempty('Alias is required')
  .max(30, 'Alias max length is 30 characters')
  .trim()
  .toLowerCase()
  .refine(async (alias) => {
    const findUser = await getUserByAlias(alias);
    if (findUser.rowCount === 0) return false;
    return true;
  }, "User doesn't exists");

// eslint-disable-next-line import/prefer-default-export
export { userIdSchema, userAliasSchema };
