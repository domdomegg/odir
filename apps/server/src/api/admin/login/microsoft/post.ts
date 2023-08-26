import { OAuth2Client } from 'google-auth-library';
import createHttpError from 'http-errors';
import { middyfy } from '../../../../helpers/wrapper';
import env from '../../../../env/env';
import { login } from '../../../../helpers/login';
import { $GoogleLoginRequest, $LoginResponse } from '../../../../schemas';
import IdTokenVerifier from 'idtoken-verifier';
import jwt from 'jsonwebtoken';

// Exchanges a Google id and access token for a Raise access token
export const main = middyfy($GoogleLoginRequest, $LoginResponse, false, async (event) => {
  if (!env.GOOGLE_LOGIN_ENABLED) throw new createHttpError.Unauthorized('Google login is not enabled');

  let email = '';

    const issuer = jwt.decode(event.body.idToken, { json: true })?.iss;

    if (!issuer) {
        throw new createHttpError.Unauthorized('Missing issuer');
    }

    const urlPattern = /^https:\/\/login\.microsoftonline\.com\/([0-9a-f-]+)\/v2\.0$/;
    function validateIssuerAndGetTenantId(url: string): string {
        const match = url.match(urlPattern);
        if (match) {
          const tenantId = match[1];
          return tenantId ;
        } else {
            throw new createHttpError.Unauthorized('Invalid issuer');
        }
      };

    const tenantId = validateIssuerAndGetTenantId(issuer);

  const verifier = new IdTokenVerifier({
    issuer: `https://login.microsoftonline.com/${tenantId}/v2.0`,
    audience: env.MICROSOFT_LOGIN_CLIENT_ID,
    jwksURI: `https://login.microsoftonline.com/${tenantId}/discovery/v2.0/keys`,
  });

  verifier.verify(event.body.idToken, (error, payload) => {
    if (error) {
      // handle the error
      console.log(error.message);
      console.log(error.name);
      console.log(error);
      console.log(Object.keys(error));
      console.log(issuer);
      throw new createHttpError.Unauthorized('Error check')
    };
  });
  email = verifier.decode(event.body.idToken).payload.email;
  return login(email.toLowerCase());
});
