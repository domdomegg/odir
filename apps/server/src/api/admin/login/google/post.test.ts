import {
  test, expect, beforeEach, vi,
  Mock
} from 'vitest';
import { OAuth2Client } from 'google-auth-library';
import createHttpError from 'http-errors';
import { call } from '../../../../../local/testHelpers';
import env from '../../../../env/env';
import { login } from '../../../../helpers/login';
import { main } from './post';
import { LoginResponse } from '../../../../schemas';
import { getMethodsForEmail } from '../methods/{email}/get';

const googleTokenPayload = {
  iss: 'accounts.google.com', // verified by the real library
  email_verified: true,
  sub: '12345',
  email: 'test@gmail.com',
  aud: env.GOOGLE_LOGIN_CLIENT_ID, // verified by the real library
  iat: 1609459200,
  exp: 2524608000, // verified by the real library
};

const getPayload = vi.fn();
const verifyIdToken = vi.fn();

vi.mock('google-auth-library', () => ({
  OAuth2Client: vi.fn(),
}));

vi.mock('../../../../helpers/login', () => ({
  login: vi.fn(),
}));

vi.mock('../methods/{email}/get', () => ({
  getMethodsForEmail: vi.fn(),
}));

beforeEach(() => {
  (login as unknown as Mock).mockImplementation((email: string) => {
    if (email === 'test@gmail.com') {
      const result: LoginResponse = {
        accessToken: { value: 'mockA', expiresAt: 0 },
        refreshToken: { value: 'mockR', expiresAt: 1 },
        groups: [],
      };
      return result;
    }

    throw new createHttpError.Forbidden(`Your account, ${email}, has not yet been given access to the platform (requires allowlisting). Contact support (see footer) with details about who you are to get an invite.`);
  });
  (getMethodsForEmail as unknown as Mock).mockImplementation((email: string) => {
    if (email === 'test@gmail.com' || email === 'bad@gmail.com') {
      return Promise.resolve(['google']);
    }
    return Promise.resolve(['email']);
  });
  (OAuth2Client as unknown as Mock).mockImplementation(() => ({
    verifyIdToken,
  }));
  verifyIdToken.mockResolvedValue({ getPayload });
});

test('get working access token for valid Google token', async () => {
  getPayload.mockReturnValue(googleTokenPayload);

  const response = await call(main, { auth: false })({
    idToken: 'idTokenValue',
  });

  expect(verifyIdToken).toHaveBeenCalledTimes(1);
  expect(verifyIdToken).toHaveBeenCalledWith({
    idToken: 'idTokenValue',
    audience: env.GOOGLE_LOGIN_CLIENT_ID,
  });

  expect(response.accessToken.value).toEqual('mockA');
  expect(response.refreshToken.value).toEqual('mockR');
});

test.each([
  ['missing payload', undefined, 'Missing payload', 401],
  ['missing email', { ...googleTokenPayload, email: undefined }, 'missing an email', 401],
  ['with unverified email', { ...googleTokenPayload, email_verified: false }, 'not verified', 401],
  ['with non-eligible email', { ...googleTokenPayload, email: 'bad@outlook.com' }, 'not eligible for Google login', 403],
  ['with non-allowlisted email', { ...googleTokenPayload, email: 'bad@gmail.com' }, 'has not yet been given access to the platform', 403],
])('rejects Google token %s', async (description, token, errMessage, status) => {
  getPayload.mockReturnValue(token);

  const response = await call(main, { rawResponse: true, auth: false })({
    idToken: 'idTokenValue',
  });

  expect(verifyIdToken).toHaveBeenCalledTimes(1);
  expect(verifyIdToken).toHaveBeenCalledWith({
    idToken: 'idTokenValue',
    audience: env.GOOGLE_LOGIN_CLIENT_ID,
  });

  expect(response.statusCode).toBe(status);
  expect(response.body).toContain(errMessage);
});

test('rejects invalid Google token', async () => {
  verifyIdToken.mockRejectedValueOnce('Invalid token for some reason!');

  const response = await call(main, { rawResponse: true, auth: false })({
    idToken: 'idTokenValue',
  });

  expect(verifyIdToken).toHaveBeenCalledTimes(1);
  expect(verifyIdToken).toHaveBeenCalledWith({
    idToken: 'idTokenValue',
    audience: env.GOOGLE_LOGIN_CLIENT_ID,
  });

  expect(response.statusCode).toBe(401);
  expect(response.body).toContain('idToken: Invalid token');
  expect(response.body).not.toContain('Invalid token for some reason!');
});
