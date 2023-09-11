import createHttpError from 'http-errors';
import { ulid } from 'ulid';
import { middyfy } from '../../../../../helpers/wrapper';
import env from '../../../../../env/env';
import { $EmailInitiateLoginRequest } from '../../../../../schemas';
import { insert, scan } from '../../../../../helpers/db';
import { emailLoginTable } from '../../../../../helpers/tables';
import { sendEmail } from '../../../../../helpers/email';
import emailLoginEmail from '../../../../../helpers/email/emailLogin';
import { EMAIL_LOGIN_VALIDITY_IN_SECONDS } from '../post';
import { getMethodsForEmail } from '../../methods/{email}/get';

export const main = middyfy($EmailInitiateLoginRequest, null, false, async (event) => {
  if (!(await getMethodsForEmail(event.body.email)).includes('email')) {
    throw new createHttpError.Forbidden(`Your account, ${event.body.email}, is not eligible for email login. Choose a different login method.`);
  }

  const previousLogins = (await scan(emailLoginTable)).filter((l) => l.email === event.body.email);
  const loginsLastHour = previousLogins.filter((l) => l.createdAt > Date.now() / 1000 - 3600);
  const loginsLast3Minutes = previousLogins.filter((l) => l.createdAt > Date.now() / 1000 - 180);
  const loginsLast15Seconds = previousLogins.filter((l) => l.createdAt > Date.now() / 1000 - 15);
  if (loginsLastHour.length >= 10 || loginsLast3Minutes.length >= 3) {
    throw new createHttpError.TooManyRequests('Too many recent logins. Try waiting a little while before logging in again.');
  }
  if (loginsLast15Seconds.length >= 1) {
    throw new createHttpError.TooManyRequests('You just requested to log in recently. Try waiting a little while before logging in again.');
  }

  const now = Math.floor(Date.now() / 1000);
  const emailLogin = await insert(emailLoginTable, {
    id: ulid(),
    email: event.body.email,
    createdAt: now,
    ttl: now + EMAIL_LOGIN_VALIDITY_IN_SECONDS
  });
  const verificationHref = `http${env.STAGE === 'local' ? '' : 's'}://${env.CUSTOM_ODIR_DOMAIN}/login-callback/email#token=${emailLogin.id}`;

  await sendEmail('Login to Directory Navigator', emailLoginEmail(verificationHref), event.body.email);
});
