import { Pool } from 'pg';

let poolConfig = {};

if (process.env.NODE_ENV === 'production') {
  poolConfig = {
    database: process.env.DATABASE_DB_NAME_PRODUCTION as string,
    host: process.env.DATABASE_HOST_PRODUCTION as string,
    user: process.env.DATABASE_USER_PRODUCTION as string,
    password: process.env.DATABASE_PASSWORD_PRODUCTION as string,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}
if (process.env.NODE_ENV === 'development') {
  poolConfig = {
    database: process.env.DATABASE_DB_NAME_DEVELOPMENT as string,
    host: process.env.DATABASE_HOST_DEVELOPMENT as string,
    user: process.env.DATABASE_USER_DEVELOPMENT as string,
    password: process.env.DATABASE_PASSWORD_DEVELOPMENT as string,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}
if (process.env.NODE_ENV === 'testing') {
  poolConfig = {
    database: process.env.DATABASE_DB_NAME_TESTING as string,
    host: process.env.DATABASE_HOST_TESTING as string,
    user: process.env.DATABASE_USER_TESTING as string,
    password: process.env.DATABASE_PASSWORD_TESTING as string,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
  };
}

const pool = new Pool(poolConfig);

export default pool;
