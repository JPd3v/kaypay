import request from 'supertest';
import app from '@src/app';
import { ZodIssue } from 'zod';
import { SignUpType } from '@src/schemas';
import { deleteAllUsersFromDb, logUser } from '@tests/testing.utils';
import {
  addUser,
  getUserByAlias,
  getUserByEmail,
  hashPassword,
  updateUser,
} from '@src/services/index';

const signUpRequestMock: SignUpType = {
  alias: 'testAlias',
  firstName: 'testFirstName',
  lastName: 'testLastname',
  email: 'testEmail@test.com',
  confirmPassword: 'testPassword',
  password: 'testPassword',
};

describe('auth controllers', () => {
  beforeEach(async () => {
    await deleteAllUsersFromDb();
  });
  describe('sign Up controller', () => {
    test('fails and send validation errors if any validation error occurs', async () => {
      const { statusCode, body } = await request(app).post('/auth/sign-up');
      const bodyTyped = body as Array<ZodIssue>;

      expect(statusCode).toBe(400);
      expect(Array.isArray(body)).toBe(true);
      bodyTyped.forEach((element) => {
        expect(element).toHaveProperty('path');
        expect(element).toHaveProperty('message');
        expect(element).toHaveProperty('code');
      });
    });

    test('fails if alias is already on use', async () => {
      await addUser({
        alias: 'testAlias',
        email: 'validEmail@test.com',
        firstName: 'name',
        lastName: 'lastname',
        password: 'password',
      });

      const { body, statusCode } = await request(app)
        .post('/auth/sign-up')
        .send(signUpRequestMock);

      expect(statusCode).toBe(400);
      expect(body).toHaveLength(1);
      expect(body[0]).toHaveProperty('message', 'Alias already in use');
    });

    test('fails if email is already on use', async () => {
      await addUser({
        alias: 'validAlias',
        email: 'testEmail@test.com',
        firstName: 'name',
        lastName: 'lastname',
        password: 'password',
      });

      const { body, statusCode } = await request(app)
        .post('/auth/sign-up')
        .send(signUpRequestMock);

      expect(statusCode).toBe(400);
      expect(body).toHaveLength(1);
      expect(body[0]).toHaveProperty('message', 'Email already in use');
    });

    test("fails if password and confirmPassword don't match", async () => {
      const signUpWithPassError = {
        ...signUpRequestMock,
        password: 'apassword',
        confirmPassword: 'anotherpassword',
      };

      const { body, statusCode } = await request(app)
        .post('/auth/sign-up')
        .send(signUpWithPassError);

      expect(statusCode).toBe(400);
      expect(body).toHaveLength(1);
      expect(body[0]).toHaveProperty(
        'message',
        "Password and Confirm Password don't match",
      );
      expect(body[0].path).toContain('password');
      expect(body[0].path).toContain('confirmPassword');
    });

    test('successfully save user in db if all inputs are valid', async () => {
      const { statusCode } = await request(app)
        .post('/auth/sign-up')
        .send(signUpRequestMock);

      expect(statusCode).toBe(200);

      const userOnDb = await getUserByAlias('testAlias');
      expect(userOnDb.rowCount).toBe(1);
    });

    test('on success returns the created user info and refresh token cookie', async () => {
      const { statusCode, headers, body } = await request(app)
        .post('/auth/sign-up')
        .send(signUpRequestMock);

      expect(statusCode).toBe(200);
      expect(headers['set-cookie']).toBeDefined();
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('firstName');
      expect(body).toHaveProperty('lastName');
      expect(body).toHaveProperty('alias');
      expect(body).toHaveProperty('email');
    });
  });

  describe('log in controller', () => {
    beforeEach(async () => {
      await addUser({
        alias: 'logAlias',
        email: 'logEmail@test.com',
        firstName: 'name',
        lastName: 'lastname',
        password: await hashPassword('password'),
      });
    });

    test("fails if user doesn't exists", async () => {
      const { body, statusCode } = await request(app)
        .post('/auth/log-in/')
        .send({ email: 'nonExists@test.com', password: 'password' });

      expect(statusCode).toBe(422);
      expect(body).toMatchObject({ error: 'wrong email or password' });
    });

    test("fails if user password isn't correct", async () => {
      const { body, statusCode } = await request(app)
        .post('/auth/log-in')
        .send({
          email: 'logEmail@test.com',
          password: 'wrongPassword',
        });

      expect(statusCode).toBe(422);
      expect(body).toMatchObject({ error: 'wrong email or password' });
    });

    test('success if credentials are correct and returns user info, accessToken and refreshToken as cookie', async () => {
      const { body, statusCode, headers } = await request(app)
        .post('/auth/log-in')
        .send({
          email: 'logEmail@test.com',
          password: 'password',
        });

      expect(statusCode).toBe(200);

      expect(body).toHaveProperty('alias');
      expect(body).toHaveProperty('balance');
      expect(body).toHaveProperty('email');
      expect(body).toHaveProperty('firstName');
      expect(body).toHaveProperty('lastName');
      expect(body).toHaveProperty('id');
      expect(headers['set-cookie']).toBeDefined();

      const findUpdatedUser = await getUserByEmail('logEmail@test.com');

      expect(findUpdatedUser.rows[0].refreshToken).toBe(
        headers['set-cookie'][1].slice(13).split(';')[0],
      );
    });
  });

  describe('logedUserInformation controller', () => {
    test('fails if access token cookie is not provided', async () => {
      const { body, statusCode } = await request(app).get('/auth/me');

      expect(statusCode).toBe(400);
      expect(body).toMatchObject({ error: 'User not logged in' });
    });

    test('fails if access token is expired', async () => {
      const expiredCookie =
        'accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjgsImZpcnN0TmFtZSI6InMiLCJsYXN0TmFtZSI6Imxhc3ROYW1lIiwiYWxpYXMiOiIxMiIsImVtYWlsIjoibG9nRW1haWxAdGVzdC5jb20iLCJpYXQiOjE2OTI0ODQ1MTcsImV4cCI6MTY5MjQ4NTQxN30.RKgceFeNPl-yQpBE7f7Sl9m_yNZrdprnzRw_K8syHhc; Path=/; Secure; HttpOnly;';

      const { body, statusCode } = await request(app)
        .get('/auth/me')
        .set('cookie', expiredCookie);

      expect(statusCode).toBe(401);
      expect(body).toMatchObject({ error: 'Unauthorized' });
    });

    test('success if accessToken is valid and returns user profile information', async () => {
      await addUser({
        alias: 'logAlias',
        email: 'logEmail@test.com',
        firstName: 'name',
        lastName: 'lastname',
        password: await hashPassword('password'),
      });

      const user = await logUser('logEmail@test.com', 'password');
      const userCookies = user.headers['set-cookie'];

      const { body, statusCode } = await request(app)
        .get('/auth/me')
        .set('cookie', userCookies);

      expect(statusCode).toBe(200);
      expect(body).toMatchObject({
        alias: 'logAlias',
        balance: '0',
        email: 'logEmail@test.com',
        firstName: 'logEmail@test.com',
        lastName: 'lastname',
      });
    });
  });

  describe('refreshTokens controller', () => {
    beforeEach(async () => {
      await addUser({
        alias: 'logAlias',
        email: 'logEmail@test.com',
        firstName: 'name',
        lastName: 'lastname',
        password: await hashPassword('password'),
      });
    });

    test("fails if refresh token cookie isn't provided", async () => {
      const { body, statusCode } = await request(app).get(
        '/auth/refresh-token',
      );

      expect(statusCode).toBe(400);
      expect(body).toMatchObject({ error: 'refresh token missing' });
    });

    test('fails if refresh token is expired and clears client auth cookies', async () => {
      const expiredRefreshToken =
        'refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjgsImZpcnN0TmFtZSI6InMiLCJsYXN0TmFtZSI6Imxhc3ROYW1lIiwiYWxpYXMiOiIxMiIsImVtYWlsIjoibG9nRW1haWxAdGVzdC5jb20iLCJpYXQiOjE2OTI0ODQ1MTcsImV4cCI6MTY5MjQ4NTQxN30.RKgceFeNPl-yQpBE7f7Sl9m_yNZrdprnzRw_K8syHhc; Path=/; Secure; HttpOnly;';
      const { body, statusCode, headers } = await request(app)
        .get('/auth/refresh-token')
        .set('cookie', expiredRefreshToken);

      expect(statusCode).toBe(401);
      expect(headers['set-cookie']).not.toBeDefined();
      expect(body).toMatchObject({ error: 'Unauthorized' });
    });

    test("fails if refresh token doesn't  match with user refresh token on database", async () => {
      const user = await logUser('logEmail@test.com', 'password');

      const cookies = user.headers['set-cookie'];

      await updateUser({
        id: user.body.id,
        refreshToken:
          'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjgsImZpcnN0TmFtZSI6InMiLCJsYXN0TmFtZSI6Imxhc3ROYW1lIiwiYWxpYXMiOiIxMiIsImVtYWlsIjoibG9nRW1haWxAdGVzdC5jb20iLCJpYXQiOjE2OTI0ODQ1MTcsImV4cCI6MTY5MjQ4NTQxN30.RKgceFeNPl-yQpBE7f7Sl9m_yNZrdprnzRw_K8syHhc',
      });

      const { body, statusCode } = await request(app)
        .get('/auth/refresh-token')
        .set('cookie', cookies);

      expect(statusCode).toBe(401);
      expect(body).toMatchObject({ error: 'Unauthorized' });
    });

    test('success if refresh token match with the token stored in database and returns new access and refresh tokens on cookies', async () => {
      const user = await logUser('logEmail@test.com', 'password');

      const cookies = user.headers['set-cookie'];

      const { body, statusCode, headers } = await request(app)
        .get('/auth/refresh-token')
        .set('cookie', cookies);

      expect(statusCode).toBe(200);
      expect(body).toMatchObject({ message: 'tokens refreshed successfully' });
      expect(headers['set-cookie']).toBeDefined();
    });
  });

  describe('logOut controller', () => {
    test('fails if access token cookie is not provided', async () => {
      const { body, statusCode } = await request(app).post('/auth/log-out');

      expect(statusCode).toBe(400);
      expect(body).toMatchObject({ error: 'User not logged in' });
    });

    test('fails if access token is expired', async () => {
      const expiredCookie =
        'accessToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MjgsImZpcnN0TmFtZSI6InMiLCJsYXN0TmFtZSI6Imxhc3ROYW1lIiwiYWxpYXMiOiIxMiIsImVtYWlsIjoibG9nRW1haWxAdGVzdC5jb20iLCJpYXQiOjE2OTI0ODQ1MTcsImV4cCI6MTY5MjQ4NTQxN30.RKgceFeNPl-yQpBE7f7Sl9m_yNZrdprnzRw_K8syHhc; Path=/; Secure; HttpOnly;';

      const { body, statusCode } = await request(app)
        .post('/auth/log-out')
        .set('cookie', expiredCookie);

      expect(statusCode).toBe(401);
      expect(body).toMatchObject({ error: 'Unauthorized' });
    });

    test('success if access token is valid, clears client cookies and removes refresh token from database', async () => {
      await addUser({
        alias: 'logAlias',
        email: 'logEmail@test.com',
        firstName: 'name',
        lastName: 'lastname',
        password: await hashPassword('password'),
      });

      const user = await logUser('logEmail@test.com', 'password');
      const cookies = user.headers['set-cookie'];

      const { body, statusCode, headers } = await request(app)
        .post('/auth/log-out')
        .set('cookie', cookies);

      const userOnDb = await getUserByEmail('logEmail@test.com');
      expect(statusCode).toBe(200);
      expect(userOnDb.rows[0].refreshToken).toBe('');
      expect(body).toMatchObject({ message: 'log out successfully' });
      expect(headers['set-cookie'][0]).toMatch(/refreshToken=;/);
      expect(headers['set-cookie'][1]).toMatch(/accessToken=;/);
    });
  });
});
