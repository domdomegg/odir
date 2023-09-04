import createHttpError from 'http-errors';
import env from '../../../../../env/env';
import { middyfy } from '../../../../../helpers/wrapper';
import { $Email, $LoginMethodsResponse, LoginMethodsResponse } from '../../../../../schemas';

export const main = middyfy(null, $LoginMethodsResponse, false, async (event) => {
  const { email } = event.pathParameters;
  if (!new RegExp(($Email as { pattern: string }).pattern).test(email)) {
    throw new createHttpError.BadRequest('Invalid email');
  }

  const methods = getMethodsForEmail(email);
  return {
    methods: env.IMPERSONATION_LOGIN_ENABLED
      ? [...methods, 'impersonation' as const]
      : methods
  };
});

const getMethodsForEmail = (email: string): LoginMethodsResponse['methods'] => {
  const isEmailInDomains = (...domains: string[]) => domains.some((d) => email.endsWith(`@${d}`));

  // TODO: do this via a database lookup?
  if (isEmailInDomains('gmail.com', 'joinraise.org', 'bluedotimpact.org')) {
    return ['google', 'email'];
  }

  return ['email'];
};
