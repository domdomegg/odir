import createHttpError, { isHttpError } from 'http-errors';
import { middyfy } from '../../../../helpers/wrapper';
import { login } from '../../../../helpers/login';
import { $EmailLoginRequest, $LoginResponse } from '../../../../schemas';
import { emailLoginTable } from '../../../../helpers/tables';
import { get } from '../../../../helpers/db';

export const EMAIL_LOGIN_VALIDITY_IN_SECONDS = 3600;

// Exchanges a Google id and access token for a Raise access token
export const main = middyfy($EmailLoginRequest, $LoginResponse, false, async (event) => {
  const emailLogin = await get(emailLoginTable, { id: event.body.token }).catch((error) => {
    if (isHttpError(error) && error.status === 404) {
      throw new createHttpError.Unauthorized('Invalid or expired token. Ensure you are clicking the most recent login email, or request a new email login.');
    }
    throw error;
  });

  const now = Math.floor(Date.now() / 1000);
  if (now > emailLogin.ttl) {
    throw new createHttpError.Unauthorized('Expired token (past ttl).');
  }
  if (now > emailLogin.createdAt + EMAIL_LOGIN_VALIDITY_IN_SECONDS) {
    throw new createHttpError.Unauthorized('Expired token (past validity limit).');
  }

  return login(emailLogin.email);
});
