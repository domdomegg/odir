import {
  test, expect, beforeEach, vi
} from 'vitest';
import createHttpError from 'http-errors';
import { call } from '../../../../../local/testHelpers';
import { main } from './post';
import env from '../../../../env/env';
import { login } from '../../../../helpers/login';
import { LoginResponse } from '../../../../schemas';

vi.mock('../../../../helpers/login', () => ({
  login: vi.fn(),
}));

beforeEach(() => {
  (login as unknown as vi.Mock).mockImplementation((email) => {
    if (email === 'test@adamjones.me') {
      const result: LoginResponse = {
        accessToken: { value: 'mockA', expiresAt: 0 },
        refreshToken: { value: 'mockR', expiresAt: 1 },
        groups: [],
      };
      return result;
    }

    throw new createHttpError.Forbidden(`Your account, ${email}, is not allowlisted to use the platform`);
  });
});

test('get working tokens for allowlisted email', async () => {
  const response = await call(main, { auth: false })({
    email: 'test@adamjones.me',
  });

  expect(response.accessToken.value).toEqual('mockA');
  expect(response.refreshToken.value).toEqual('mockR');
});

test.each([
  ['with non-allowlisted email', { email: 'bad@adamjones.me' }, 'not allowlisted', 403],
])('rejects %s', async (description, payload, errMessage, status) => {
  const response = await call(main, { rawResponse: true, auth: false })(payload);

  expect(response.statusCode).toBe(status);
  expect(response.body).toContain(errMessage);
});

test.each([
  ['with non-enabled env', { STAGE: 'dev', IMPERSONATION_LOGIN_ENABLED: false } as const, 'not enabled', 401],
  ['in the prod stage', { STAGE: 'prod', IMPERSONATION_LOGIN_ENABLED: true } as const, 'not be enabled in prod', 401],
])('rejects %s', async (description, envOverrides, errMessage, status) => {
  const envBefore = { ...env };
  env.STAGE = envOverrides.STAGE;
  env.IMPERSONATION_LOGIN_ENABLED = envOverrides.IMPERSONATION_LOGIN_ENABLED;

  const response = await call(main, { rawResponse: true, auth: false })({ email: 'test@adamjones.me' });

  expect(response.statusCode).toBe(status);
  expect(response.body).toContain(errMessage);

  env.STAGE = envBefore.STAGE;
  env.IMPERSONATION_LOGIN_ENABLED = envBefore.IMPERSONATION_LOGIN_ENABLED;
});
