import { pool, queries } from '@src/database';
import { Record } from '@src/types';
import calculatePaginationOffset from '@src/utils/pagination.utils';
import { Pool, PoolClient } from 'pg';

interface GetUserRecordsParams {
  userId: number;
  page: number;
  limit: number;
}

function parseUserRecords(records: Record[]) {
  return records.map((record) => {
    const { alias, aliasCbu, balance, bank, createdAt, id, type, userId } =
      record;
    if (record.type === 'deposit') {
      return {
        balance,
        createdAt,
        type,
        id,
        userId,
      };
    }
    if (record.type === 'withdraw') {
      return { balance, createdAt, type, userId, bank, aliasCbu };
    }

    if (record.type === 'received') {
      return { balance, createdAt, type, id, alias };
    }
    if (record.type === 'sended') {
      return {
        balance,
        createdAt,
        type,
        id,
        alias,
      };
    }

    return record;
  });
}

async function getUserRecords(
  { userId, page, limit }: GetUserRecordsParams,
  client: PoolClient | Pool = pool,
) {
  const offset = calculatePaginationOffset(page, limit);

  const records = await client.query<Record>(queries.records.getUserRecords, [
    userId,
    offset,
    limit,
  ]);

  return parseUserRecords(records.rows);
}

// eslint-disable-next-line import/prefer-default-export
export { getUserRecords };
