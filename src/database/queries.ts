const sqlSelectAlias = {
  userAliases: `first_name AS "firstName", last_name AS "lastName", refresh_token AS "refreshToken", balance, password, alias, email, id`,
  depositsAliases: `user_id AS "userId", created_at AS "createdAt", balance, id`,
};

const users = {
  addUser: `INSERT INTO users (first_name, last_name, alias, email, password )
  VALUES($1,$2,$3,$4,$5)
  Returning ${sqlSelectAlias.userAliases}` as const,
  findUserById:
    `SELECT ${sqlSelectAlias.userAliases} FROM users WHERE id = $1` as const,
  findUserByEmail:
    `SELECT ${sqlSelectAlias.userAliases} FROM users WHERE email ILIKE $1` as const,
  findUserByAlias:
    `SELECT ${sqlSelectAlias.userAliases} FROM users WHERE alias ILIKE $1` as const,
  updateUser: `UPDATE USERS 
  SET first_name = COALESCE($1,first_name),
  last_name = COALESCE($2,last_name),
  alias = COALESCE($3,alias),
  email = COALESCE($4,email),
  password = COALESCE($5,password),
  refresh_token = COALESCE($6,refresh_token),
  balance = COALESCE($7,balance)
  WHERE id = $8 RETURNING ${sqlSelectAlias.userAliases}` as const,
  updateUserBalance:
    `UPDATE USERS SET balance = balance + $1 WHERE id = $2 RETURNING ${sqlSelectAlias.userAliases}` as const,
};

const deposits = {
  findDepositById: `SELECT ${sqlSelectAlias.depositsAliases} FROM deposits WHERE id =$1`,
  addDeposit:
    `INSERT INTO deposits (user_id, balance) VALUES($1,$2) RETURNING ${sqlSelectAlias.depositsAliases}` as const,
};

const testingUtils = {
  user: {
    deleteAll: `DELETE FROM users`,
  },
  deposits: {
    deleteAll: `DELETE FROM deposits`,
  },
  deleteAll: `DELETE FROM deposits; DELETE FROM users`,
};

const queries = {
  users,
  testingUtils,
  deposits,
};

export default queries;
