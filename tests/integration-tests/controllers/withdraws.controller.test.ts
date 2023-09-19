import request from 'supertest';
import app from '@src/app';
import { NewWithdrawType } from '@src/schemas';
import { createTestUser, deleteAllFromDb, logUser } from '@tests/testing.utils';
import { getUserById, updateUserBalance } from '@src/services';
import { ProfileUser } from '@src/types';

const withdrawExample = (balance: number): NewWithdrawType => ({
  balance,
  aliasCbu: 'exampleCbu',
  bankName: 'exampleBank',
});

describe('withdraws controllers', () => {
  beforeEach(async () => {
    await deleteAllFromDb();
    await createTestUser();
  });

  describe('new withdraw', () => {
    test("fails if user isn't authtenticated ", async () => {
      const { body, statusCode } = await request(app)
        .post('/withdraws')
        .send(withdrawExample(1));

      expect(body).toMatchObject({ error: 'User not logged in' });
      expect(statusCode).toBe(400);
    });

    test("fails if body input isn't valid ", async () => {
      const user = await logUser('logEmail@test.com', 'password');
      const userAccessCookie = user.headers['set-cookie'];

      const noInputRequest = await request(app)
        .post('/withdraws')
        .send({})
        .set('Cookie', userAccessCookie);

      const invalidBalanceRequest = await request(app)
        .post('/withdraws')
        .send(withdrawExample(0))
        .set('Cookie', userAccessCookie);

      expect(invalidBalanceRequest.status).toBe(400);
      expect(noInputRequest.status).toBe(400);
    });

    test('fails if you try to withdraw more balance than the account has', async () => {
      const user = await logUser('logEmail@test.com', 'password');
      const userAccessCookie = user.headers['set-cookie'];
      const userBody: ProfileUser = user.body;
      await updateUserBalance(userBody.id, 20);

      const { body, statusCode } = await request(app)
        .post('/withdraws')
        .send(withdrawExample(21))
        .set('Cookie', userAccessCookie);

      const updatedUser = (await getUserById(userBody.id)).rows[0];

      expect(body).toMatchObject({ error: 'Insufficient balance' });
      expect(statusCode).toBe(400);
      expect(updatedUser.balance).toBe(20);
    });

    test('successfully do the withdraw if user have balance', async () => {
      const user = await logUser('logEmail@test.com', 'password');
      const userAccessCookie = user.headers['set-cookie'];
      const userBody: ProfileUser = user.body;

      await updateUserBalance(userBody.id, 20);

      const { body, statusCode } = await request(app)
        .post('/withdraws')
        .send(withdrawExample(15))
        .set('Cookie', userAccessCookie);

      const updatedUser = (await getUserById(userBody.id)).rows[0];

      expect(statusCode).toBe(200);
      expect(body).toMatchObject({
        aliasCbu: withdrawExample(1).aliasCbu,
        balance: 15,
        bank: withdrawExample(1).bankName,
      });
      expect(updatedUser.balance).toBe(5);
    });
  });
});
