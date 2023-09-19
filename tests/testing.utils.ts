import { pool, queries } from '@src/database';
import request from 'supertest';
import app from '@src/app';
import { signUpUser } from '@src/services';

async function deleteAllUsersFromDb() {
  const query = await pool.query(queries.testingUtils.user.deleteAll, []);

  return query;
}

async function deleteDepositFromDb() {
  const query = await pool.query(queries.testingUtils.deposits.deleteAll, []);

  return query;
}

async function deleteAllFromDb() {
  const query = await pool.query(queries.testingUtils.deleteAll, []);

  return query;
}

async function createTestUser(
  alias = 'logAlias',
  email = 'logEmail@test.com',
  firstName = 'name',
  lastName = 'lastname',
  password = 'password',
) {
  const newUser = await signUpUser({
    alias,
    email,
    firstName,
    lastName,
    password,
  });

  return newUser;
}
async function logUser(email: string, password: string) {
  const response = await request(app).post('/auth/log-in').send({
    email,
    password,
  });

  return response;
}

export {
  deleteAllUsersFromDb,
  logUser,
  deleteDepositFromDb,
  deleteAllFromDb,
  createTestUser,
};
