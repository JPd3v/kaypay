import { pool, queries } from '@src/database';

async function deleteAllUsersFromDb() {
  const query = await pool.query(queries.testingUtils.user.deleteAll, []);

  return query;
}

// eslint-disable-next-line import/prefer-default-export
export { deleteAllUsersFromDb };
