import app from '@src/app';
import {
  balanceTransference,
  createUserDeposit,
  doWithdraw,
} from '@src/services';
import { ProfileUser } from '@src/types';
import { createTestUser, deleteAllFromDb, logUser } from '@tests/testing.utils';
import request from 'supertest';

describe.only('records controllers ', () => {
  beforeEach(async () => {
    await deleteAllFromDb();
    await createTestUser();
  });
  describe('get records', () => {
    test('fails if user isnt authenticated', async () => {
      const { statusCode, body } = await request(app).get('/records');

      expect(statusCode).toBe(400);
      expect(body).toMatchObject({ error: 'User not logged in' });
    });

    test('succesfully gets all type of records', async () => {
      const logedUser = await logUser();
      const anotherUser = await createTestUser(
        'anotherUser',
        'anotherUser@test.com',
      );

      const userAccessCookie = logedUser.headers['set-cookie'][0];
      const userInfo = logedUser.body as ProfileUser;

      await createUserDeposit(userInfo.id, 100);
      await balanceTransference({
        senderId: userInfo.id,
        balance: 10,
        alias: anotherUser.userProfileInformation.alias,
      });

      await balanceTransference({
        senderId: anotherUser.userProfileInformation.id,
        balance: 5,
        alias: userInfo.alias,
      });

      await doWithdraw({
        userId: userInfo.id,
        aliasCbu: 'testAlias',
        balance: 5,
        bank: 'testBank',
      });

      const { statusCode, body } = await request(app)
        .get('/records?pageSize=10&currentPage=0')
        .set('Cookie', userAccessCookie);

      expect(statusCode).toBe(200);
      expect(body).toHaveLength(4);
    });
  });
});
