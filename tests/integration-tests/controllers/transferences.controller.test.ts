import app from '@src/app';
import { getUserById, signUpUser, updateUser } from '@src/services';
import { getUserTransferences } from '@src/services/transferences.services';
import { ProfileUser } from '@src/types';
import { deleteAllFromDb, logUser } from '@tests/testing.utils';
import request from 'supertest';

describe('newTransference controller', () => {
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

  test("fails if balance isn't between min and max range", async () => {
    const signUpReceiver = await signUpUser({
      alias: 'receiverUser',
      email: 'receiverUser@test.com',
      firstName: 'name',
      lastName: 'lastname',
      password: 'password',
    });

    const logedUser = await logUser('logEmail@test.com', 'password');
    const logedUserRefreshToken = logedUser.headers['set-cookie'][0];

    const userInfo = logedUser.body as ProfileUser;
    await updateUser({ id: userInfo.id, balance: 10 });

    const minRangeRequest = await request(app)
      .post('/transferences')
      .send({
        toUser: signUpReceiver.userProfileInformation.alias,
        balance: 0,
      })
      .set('cookie', logedUserRefreshToken);

    const maxRangeRequest = await request(app)
      .post('/transferences')
      .send({
        toUser: signUpReceiver.userProfileInformation.alias,
        balance: 10000001,
      })
      .set('cookie', logedUserRefreshToken);

    expect(minRangeRequest.statusCode).toBe(400);
    expect(minRangeRequest.body[0]).toMatchObject({
      minimum: 1,
    });

    expect(maxRangeRequest.statusCode).toBe(400);
    expect(maxRangeRequest.body[0]).toMatchObject({
      maximum: 100000,
    });
  });

  test('fails if try to transfer to himself', async () => {
    const logedUser = await logUser('logEmail@test.com', 'password');
    const logedUserRefreshToken = logedUser.headers['set-cookie'][0];

    const userInfo = logedUser.body as ProfileUser;
    await updateUser({ id: userInfo.id, balance: 10 });

    const { body, statusCode } = await request(app)
      .post('/transferences')
      .send({
        toUser: userInfo.alias,
        balance: 10,
      })
      .set('cookie', logedUserRefreshToken);

    expect(statusCode).toBe(422);
    expect(body).toMatchObject({
      error: "Can't do a transference to yourself",
    });
  });

  test("fails if user doesn't exists", async () => {
    const logedUser = await logUser('logEmail@test.com', 'password');
    const logedUserRefreshToken = logedUser.headers['set-cookie'][0];

    const userInfo = logedUser.body as ProfileUser;
    await updateUser({ id: userInfo.id, balance: 10 });

    const { body, statusCode } = await request(app)
      .post('/transferences')
      .send({
        toUser: 'non existing alias',
        balance: 1,
      })
      .set('cookie', logedUserRefreshToken);

    const senderUser = (await getUserById(userInfo.id)).rows[0];

    const transferences = await getUserTransferences(userInfo.id, 0, 30);

    expect(senderUser.balance).toBe(10);
    expect(transferences.rows).toHaveLength(0);

    expect(statusCode).toBe(400);
    expect(body[0]).toMatchObject({ message: "User doesn't exists" });
  });

  test("fails if user doesn't have enough balance", async () => {
    const signUpReceiver = await signUpUser({
      alias: 'receiverUser',
      email: 'receiverUser@test.com',
      firstName: 'name',
      lastName: 'lastname',
      password: 'password',
    });

    const logedUser = await logUser('logEmail@test.com', 'password');
    const logedUserRefreshToken = logedUser.headers['set-cookie'][0];

    const userInfo = logedUser.body as ProfileUser;
    await updateUser({ id: userInfo.id, balance: 1 });

    const { body, statusCode } = await request(app)
      .post('/transferences')
      .send({
        toUser: signUpReceiver.userProfileInformation.alias,
        balance: 10,
      })
      .set('cookie', logedUserRefreshToken);

    const senderUser = (await getUserById(userInfo.id)).rows[0];
    const receiverUser = (
      await getUserById(signUpReceiver.userProfileInformation.id)
    ).rows[0];

    const transferences = await getUserTransferences(userInfo.id, 0, 30);

    expect(senderUser.balance).toBe(1);
    expect(receiverUser.balance).toBe(0);
    expect(transferences.rows).toHaveLength(0);

    expect(statusCode).toBe(400);
    expect(body).toMatchObject({ error: 'Insufficient balance' });
  });

  test('successfully transfer balance if user have enough balance', async () => {
    const signUpReceiver = await signUpUser({
      alias: 'receiverUser',
      email: 'receiverUser@test.com',
      firstName: 'name',
      lastName: 'lastname',
      password: 'password',
    });

    const logedUser = await logUser('logEmail@test.com', 'password');
    const logedUserRefreshToken = logedUser.headers['set-cookie'][0];

    const userInfo = logedUser.body as ProfileUser;
    await updateUser({ id: userInfo.id, balance: 10 });

    const { body, statusCode } = await request(app)
      .post('/transferences')
      .send({
        toUser: signUpReceiver.userProfileInformation.alias,
        balance: 10,
      })
      .set('cookie', logedUserRefreshToken);

    const senderUser = (await getUserById(userInfo.id)).rows[0];
    const receiverUser = (
      await getUserById(signUpReceiver.userProfileInformation.id)
    ).rows[0];

    const transferences = await getUserTransferences(userInfo.id, 0, 30);

    expect(senderUser.balance).toBe(0);
    expect(receiverUser.balance).toBe(10);
    expect(transferences.rows).toHaveLength(1);

    expect(statusCode).toBe(200);
    expect(body).toMatchObject({ message: 'transference done successfully' });
  });
});
