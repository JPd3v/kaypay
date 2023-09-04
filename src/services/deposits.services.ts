import { pool, queries } from '@src/database';
import { updateUserBalance } from '@src/services';
import { Deposit } from '@src/types';
import { Pool, PoolClient } from 'pg';

async function getDepositById(
  depostId: number,
  client: PoolClient | Pool = pool,
) {
  const result = await client.query<Deposit>(queries.deposits.findDepositById, [
    depostId,
  ]);

  return result;
}

async function addDeposit(
  userId: number,
  balance: number,
  client: PoolClient | Pool = pool,
) {
  const result = await client.query(queries.deposits.addDeposit, [
    userId,
    balance,
  ]);

  return result;
}

async function createUserDeposit(userId: number, balance: number) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const deposit = await addDeposit(userId, balance, client);

    await updateUserBalance(userId, balance, client);
    await client.query('COMMIT');
    return deposit;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

// eslint-disable-next-line import/prefer-default-export
export { createUserDeposit, getDepositById };
