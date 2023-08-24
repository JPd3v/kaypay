const sqlSelectAlias = {
  userAliases: `first_name AS "firstName", last_name AS "lastName", refresh_token AS "refreshToken", balance, password, alias, email, id`,
};

// const auth = {

// };

const users = {
  addUser: `INSERT INTO users (first_name, last_name, alias, email, password )
  VALUES($1,$2,$3,$4,$5)
  Returning ${sqlSelectAlias.userAliases}`,
  findUserById: `SELECT ${sqlSelectAlias.userAliases} FROM users WHERE id = $1`,
  findUserByEmail: `SELECT ${sqlSelectAlias.userAliases} FROM users WHERE email ILIKE $1`,
  findUserByAlias: `SELECT ${sqlSelectAlias.userAliases} FROM users WHERE alias ILIKE $1`,
  updateUser: `UPDATE USERS 
  SET first_name = COALESCE($1,first_name),
  last_name = COALESCE($2,last_name),
  alias = COALESCE($3,alias),
  email = COALESCE($4,email),
  password = COALESCE($5,password),
  refresh_token = COALESCE($6,refresh_token),
  balance = COALESCE($7,balance)
  WHERE id = $8 RETURNING ${sqlSelectAlias.userAliases}`,
};

const testingUtils = {
  user: {
    deleteAll: `DELETE FROM users`,
  },
};

const queries = {
  // auth,
  users,
  testingUtils,
};

export default queries;
