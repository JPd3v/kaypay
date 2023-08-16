import { AtLeast, User } from '@src/types';
import { pool, queries } from '../database';

async function getUserByEmail(email: string) {
  const result = await pool.query<User>(queries.users.findUserByEmail, [email]);
  return result;
}

async function getUserByAlias(alias: string) {
  const result = await pool.query<User>(queries.users.findUserByAlias, [alias]);
  return result;
}

async function updateUser(user: AtLeast<User, 'id'>) {
  const result = await pool.query<User>(queries.users.updateUser, [
    user.firstName,
    user.lastName,
    user.alias,
    user.email,
    user.password,
    user.refreshToken,
    user.balance,
    user.id,
  ]);
  return result;
}

export { getUserByEmail, getUserByAlias, updateUser };
