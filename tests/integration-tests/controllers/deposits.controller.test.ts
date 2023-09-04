import app from '@src/app';
import { getDepositById, getUserById, signUpUser } from '@src/services';
import { Deposit, ProfileUser } from '@src/types';
import { deleteAllFromDb, logUser } from '@tests/testing.utils';
import request from 'supertest';
import { ZodIssue } from 'zod';

describe('deposits controllers', () => {
  beforeEach(async () => {
    await deleteAllFromDb();
    await signUpUser({
      alias: 'logAlias',
      email: 'logEmail@test.com',
      firstName: 'name',
      lastName: 'lastname',
      password: 'password',
    });
  });

  test('fails if body types are invalid', async () => {
    const { body, statusCode } = await request(app)
      .post('/deposits')
      .send({ id: 'asd', balance: '9999' });
    const typedBody = body as ZodIssue[];

    typedBody.forEach((error) => {
      expect(error.code).toBe('invalid_type');
    });
    expect(statusCode).toBe(400);
  });

  test("fails if user doesn't exists", async () => {
    const { body, statusCode } = await request(app)
      .post('/deposits')
      .send({ id: 1, balance: 90 });

    const typedBody = body as ZodIssue[];
    expect(typedBody[0].message).toBe("User doesn't exists");
    expect(statusCode).toBe(400);
  });

  test("fails if user doesn't exists", async () => {
    const { body, statusCode } = await request(app)
      .post('/deposits')
      .send({ id: 9999999, balance: 90 });

    const typedBody = body as ZodIssue[];
    expect(typedBody[0].message).toBe("User doesn't exists");
    expect(statusCode).toBe(400);
  });

  test("fails if balance isn't between min and max range", async () => {
    const logedUser = await logUser('logEmail@test.com', 'password');

    const userInfo = logedUser.body as ProfileUser;

    const minRangeRequest = await request(app)
      .post('/deposits')
      .send({ id: userInfo.id, balance: 0 });

    const typedMinRangeBody = minRangeRequest.body as ZodIssue[];

    const maxRangeRequest = await request(app)
      .post('/deposits')
      .send({ id: userInfo.id, balance: 100001 });

    const typedMaxRangeBody = maxRangeRequest.body as ZodIssue[];
    expect(typedMaxRangeBody[0].message).toBe(
      'maximum balance deposit is 100000',
    );
    expect(maxRangeRequest.statusCode).toBe(400);
    expect(typedMinRangeBody[0].message).toBe('balance should be at least 1');
    expect(minRangeRequest.statusCode).toBe(400);
  });

  test('successfully create deposit and add balance to user', async () => {
    const user = await logUser('logEmail@test.com', 'password');

    const userInfo = user.body as ProfileUser;
    const { body, statusCode } = await request(app)
      .post('/deposits')
      .send({ id: userInfo.id, balance: 10 });

    const findUpdatedUser = await getUserById(userInfo.id);
    const updatedUser = findUpdatedUser.rows[0];

    const typedBody = body as unknown as Deposit;
    const findCreatedDeposit = await getDepositById(typedBody.id);
    expect(findCreatedDeposit.rowCount).toBe(1);
    expect(updatedUser.balance).toBe(10);
    expect(statusCode).toBe(200);
  });
});
