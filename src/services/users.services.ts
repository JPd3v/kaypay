import { Pool, PoolClient } from 'pg';
import { AtLeast, User } from '@src/types';
import { pool, queries } from '../database';

async function getUserById(id: number, client: PoolClient | Pool = pool) {
  const result = await client.query<User>(queries.users.findUserById, [id]);
  return result;
}
async function addUser(
  {
    firstName,
    lastName,
    alias,
    email,
    password,
  }: Omit<User, 'balance' | 'refreshToken' | 'id'>,
  client: PoolClient | Pool = pool,
) {
  const result = await client.query<User>(queries.users.addUser, [
    firstName,
    lastName,
    alias,
    email,
    password,
  ]);
  return result;
}

async function getUserByEmail(email: string, client: PoolClient | Pool = pool) {
  const result = await client.query<User>(queries.users.findUserByEmail, [
    email,
  ]);
  return result;
}

async function getUserByAlias(alias: string, client: PoolClient | Pool = pool) {
  const result = await client.query<User>(queries.users.findUserByAlias, [
    alias,
  ]);
  return result;
}
async function updateUser(
  user: AtLeast<User, 'id'>,
  client: PoolClient | Pool = pool,
) {
  const result = await client.query<User>(queries.users.updateUser, [
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

async function updateUserBalance(
  id: number,
  balance: number,
  client: PoolClient | Pool = pool,
) {
  const result = await client.query(queries.users.updateUserBalance, [
    balance,
    id,
  ]);

  return result;
}

export {
  getUserByEmail,
  getUserByAlias,
  updateUser,
  getUserById,
  addUser,
  updateUserBalance,
};
