import createHttpError from 'http-errors';
import jwksClient from 'jwks-rsa';
import { verify } from 'jsonwebtoken';
import { middyfy } from '../../../../helpers/wrapper';
import { login } from '../../../../helpers/login';
import { $GovSsoLoginRequest, $LoginResponse } from '../../../../schemas';
import { getMethodsForEmail } from '../methods/{email}/get';

const client = jwksClient({
  jwksUri: 'https://sso.service.security.gov.uk/.well-known/jwks.json'
});

// Exchanges a GOV.UK SSO id token for one of our access tokens
export const main = middyfy($GovSsoLoginRequest, $LoginResponse, false, async (event) => {
  const tokenPayload: { email?: string, email_verified?: boolean } = await new Promise((resolve, reject) => {
    verify(event.body.idToken, (header, callback) => {
      client.getSigningKey(header.kid, (err, key) => {
        if (err) {
          callback(err);
          return;
        }
        if (!key) {
          callback(new Error('Missing key'));
          return;
        }
        callback(null, key.getPublicKey());
      });
    }, (err, decoded) => {
      if (typeof decoded === 'object' && 'email' in decoded && 'email_verified' in decoded) {
        resolve(decoded as object);
      }
      reject(err);
    });
  });

  if (!tokenPayload) throw new createHttpError.Unauthorized('idToken: Missing payload');
  if (!tokenPayload.email) throw new createHttpError.Unauthorized('Your Google account is missing an email');
  if (!tokenPayload.email_verified) throw new createHttpError.Unauthorized('Your Google account email is not verified. See https://support.google.com/accounts/answer/63950');

  if (!(await getMethodsForEmail(tokenPayload.email)).includes('gov-sso')) {
    throw new createHttpError.Forbidden(`Your account, ${tokenPayload.email}, is not eligible for Government SSO login. Choose a different login method.`);
  }

  return login(tokenPayload.email);
});
