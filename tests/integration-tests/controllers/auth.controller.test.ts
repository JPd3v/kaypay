import request from 'supertest';
import app from '@src/app';
import { ZodIssue } from 'zod';
import { SignUpType } from '@src/schemas';
import { deleteAllUsersFromDb } from '@tests/testing.utils';
import { addUser, getUserByAlias } from '@src/services/index';

const signUpRequestMock: SignUpType = {
  alias: 'testAlias',
  firstName: 'testFirstName',
  lastName: 'testLastname',
  email: 'testEmail@test.com',
  confirmPassword: 'testPassword',
  password: 'testPassword',
};

describe('auth controllers', () => {
  describe('sign Up controller', () => {
    beforeEach(async () => {
      await deleteAllUsersFromDb();
    });

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
      expect(body).toHaveProperty('accessToken');
    });
  });
});
