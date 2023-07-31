import { pool, queries } from '../database';

async function getUserByEmail(email: string) {
  const result = await pool.query(queries.users.findUserByEmail, [email]);
  return result;
}
async function getUserByAlias(alias: string) {
  const result = await pool.query(queries.users.findUserByAlias, [alias]);
  return result;
}

export { getUserByEmail, getUserByAlias };
