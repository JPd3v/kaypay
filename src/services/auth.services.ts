import { pool, queries } from '../database/index';

async function addUser(
  firstName: string,
  lastName: string,
  alias: string,
  email: string,
  password: string,
) {
  const createUser = await pool.query(queries.auth.addUser, [
    firstName,
    lastName,
    alias,
    email,
    password,
  ]);

  return createUser;
}
function logUser() {}

export { addUser, logUser };
