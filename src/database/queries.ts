const sqlSelectAlias = {
  userAliases:
    `first_name AS "firstName", last_name AS "lastName", refresh_token AS "refreshToken", balance, password, alias, email, id` as const,
  depositsAliases:
    `user_id AS "userId", created_at AS "createdAt", balance, id` as const,
  transferencesAliases:
    `sender_id AS "senderId", receiver_id AS "receiverId", created_at AS "createdAt", balance, id` as const,
  withdrawsAliases:
    `alias_cbu as "aliasCbu", created_at AS "createdAt", user_id AS "userId", bank, balance, id` as const,
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

const transferences = {
  findTransferenceById: `SELECT ${sqlSelectAlias.transferencesAliases} FROM transferences WHERE id =$1`,
  getUserTransferences:
    `SELECT balance, created_at AS "createdAt", type, id, alias  FROM ( SELECT t.balance, t.created_at,'sended' as type, t.id, u.alias 
  FROM transferences t
    JOIN users u ON u.id = t.receiver_id
    WHERE t.sender_id =$1
  UNION ALL
    SELECT t.balance, t.created_at,'received' as type, t.id,u.alias
  FROM transferences t
    JOIN users u ON u.id = t.sender_id
    WHERE t.receiver_id = $1
    ) AS transferences
    ORDER BY created_at desc
    OFFSET $2 LIMIT $3
	` as const,
  addTransference:
    `INSERT INTO transferences (sender_id, receiver_id, balance) VALUES($1,$2,$3) RETURNING ${sqlSelectAlias.transferencesAliases}` as const,
};

const withdraws = {
  addWithdraw: `INSERT INTO withdraws (
    bank, alias_cbu, user_id, balance)
    VALUES ($1, $2, $3, $4) RETURNING ${sqlSelectAlias.withdrawsAliases}` as const,
};

const testingUtils = {
  user: {
    deleteAll: `DELETE FROM users`,
  },
  deposits: {
    deleteAll: `DELETE FROM deposits`,
  },
  deleteAll: `DELETE FROM deposits; DELETE FROM transferences; DELETE FROM users;`,
};

const queries = {
  users,
  testingUtils,
  deposits,
  transferences,
  withdraws,
};

export default queries;
