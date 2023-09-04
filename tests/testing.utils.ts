import { pool, queries } from '@src/database';
import request from 'supertest';
import app from '@src/app';

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

async function logUser(email: string, password: string) {
  const response = await request(app).post('/auth/log-in').send({
    email,
    password,
  });

  return response;
}

export { deleteAllUsersFromDb, logUser, deleteDepositFromDb, deleteAllFromDb };
