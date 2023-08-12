const auth = {
  addUser: `INSERT INTO users (first_name, last_name, alias, email, password )
  VALUES($1,$2,$3,$4,$5)
  Returning first_name AS "firstName", last_name AS "lastName", alias, email, id`,
};

const users = {
  findUserByEmail: `SELECT * FROM users WHERE email ILIKE $1`,
  findUserByAlias: `SELECT * FROM users WHERE alias ILIKE $1`,
};

const testingUtils = {
  user: {
    deleteAll: `DELETE FROM users`,
  },
};

const queries = {
  auth,
  users,
  testingUtils,
};

export default queries;
