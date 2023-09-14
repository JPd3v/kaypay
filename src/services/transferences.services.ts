import { pool, queries } from '@src/database';
import { getUserByAlias, getUserById, updateUserBalance } from '@src/services';
import { PublicTransference, Transference, User } from '@src/types';
import AppError from '@src/utils/appError.utils.';
import calculatePaginationOffset from '@src/utils/pagination.utils';
import { Pool, PoolClient } from 'pg';

async function addTransference(
  {
    senderId,
    receiverId,
    balance,
  }: Pick<Transference, 'senderId' | 'receiverId' | 'balance'>,
  client: PoolClient | Pool = pool,
) {
  const transference = await client.query<Transference>(
    queries.transferences.addTransference,
    [senderId, receiverId, balance],
  );

  return transference;
}

async function balanceTransference({
  senderId,
  alias,
  balance,
}: Pick<Transference, 'senderId' | 'balance'> & Pick<User, 'alias'>) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const fromUser = (await getUserById(senderId, client)).rows[0];
    if (fromUser.balance - balance < 0) {
      throw new AppError('Insufficient balance', 400, 'Insufficient balance');
    }

    await updateUserBalance(fromUser.id, -balance, client);

    const receiverUser = (await getUserByAlias(alias, client)).rows[0];

    if (!receiverUser) {
      throw new AppError("user doesn't exists", 400, "user doesn't exists");
    }

    if (receiverUser.id === senderId) {
      throw new AppError(
        'invalid receiver',
        422,
        "Can't do a transference to yourself",
      );
    }

    await updateUserBalance(receiverUser.id, balance, client);

    await addTransference(
      {
        senderId,
        receiverId: receiverUser.id,
        balance,
      },
      client,
    );

    await client.query('COMMIT');
    return 'transference done successfully';
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

async function getUserTransferences(
  userId: number,
  currentPage: number,
  limit: number,
  client: PoolClient | Pool = pool,
) {
  const offset = calculatePaginationOffset(currentPage, limit);

  const transferences = await client.query<PublicTransference>(
    queries.transferences.getUserTransferences,
    [userId, offset, limit],
  );

  return transferences;
}

export { balanceTransference, getUserTransferences };
