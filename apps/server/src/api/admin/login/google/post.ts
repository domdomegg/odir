import { OAuth2Client } from 'google-auth-library';
import createHttpError from 'http-errors';
import { middyfy } from '../../../../helpers/wrapper';
import env from '../../../../env/env';
import { login } from '../../../../helpers/login';
import { $GoogleLoginRequest, $LoginResponse } from '../../../../schemas';
import { getMethodsForEmail } from '../methods/{email}/get';

// Exchanges a Google id and Google access token for one of our access tokens
export const main = middyfy($GoogleLoginRequest, $LoginResponse, false, async (event) => {
  const client = new OAuth2Client();
  const tokenPayload = (await client.verifyIdToken({
    idToken: event.body.idToken,
    audience: env.GOOGLE_LOGIN_CLIENT_ID,
  }).catch(() => { throw new createHttpError.Unauthorized('idToken: Invalid token'); })).getPayload();

  if (!tokenPayload) throw new createHttpError.Unauthorized('idToken: Missing payload');
  if (!tokenPayload.email) throw new createHttpError.Unauthorized('Your Google account is missing an email');
  if (!tokenPayload.email_verified) throw new createHttpError.Unauthorized('Your Google account email is not verified. See https://support.google.com/accounts/answer/63950');

  if (!(await getMethodsForEmail(tokenPayload.email)).includes('google')) {
    throw new createHttpError.Forbidden(`Your account, ${tokenPayload.email}, is not eligible for Google login. Choose a different login method.`);
  }

  return login(tokenPayload.email);
});
