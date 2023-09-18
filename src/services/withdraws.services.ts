import { pool, queries } from '@src/database';
import { getUserById, updateUserBalance } from '@src/services';
import { Withdraw } from '@src/types';
import AppError from '@src/utils/appError.utils.';
import { Pool, PoolClient } from 'pg';

async function addWithdraw(
  { userId, aliasCbu, balance, bank }: Omit<Withdraw, 'id' | 'createdAt'>,
  client: PoolClient | Pool = pool,
) {
  const withdraw = await client.query<Withdraw>(queries.withdraws.addWithdraw, [
    bank,
    aliasCbu,
    userId,
    balance,
  ]);

  return withdraw;
}

async function doWithdraw({
  userId,
  aliasCbu,
  balance,
  bank,
}: Omit<Withdraw, 'id' | 'createdAt'>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const findUser = (await getUserById(userId, client)).rows[0];

    if (findUser.balance < balance) {
      throw new AppError('Insufficient balance', 400, 'Insufficient balance');
    }

    await updateUserBalance(userId, -balance, client);

    const withdraw = await addWithdraw(
      { aliasCbu, balance, bank, userId },
      client,
    );

    await client.query('COMMIT');

    return withdraw.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export { addWithdraw, doWithdraw };
