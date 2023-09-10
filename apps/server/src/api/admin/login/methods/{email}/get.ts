import createHttpError from 'http-errors';
import env from '../../../../../env/env';
import { middyfy } from '../../../../../helpers/wrapper';
import { $Email, $LoginMethodsResponse, LoginMethodsResponse } from '../../../../../schemas';
import { domainTable } from '../../../../../helpers/tables';
import { scan } from '../../../../../helpers/db';

export const main = middyfy(null, $LoginMethodsResponse, false, async (event) => {
  const { email } = event.pathParameters;
  if (!new RegExp(($Email as { pattern: string }).pattern).test(email)) {
    throw new createHttpError.BadRequest('Invalid email');
  }

  const methods = await getMethodsForEmail(email);
  return {
    methods: env.IMPERSONATION_LOGIN_ENABLED
      ? [...methods, 'impersonation' as const]
      : methods
  };
});

const getMethodsForEmail = async (email: string): Promise<LoginMethodsResponse['methods']> => {
  const emailParts = email.split('@');
  const emailDomain = emailParts[emailParts.length - 1];
  const domainsFromDb = await scan(domainTable);
  const domain = domainsFromDb.find((d) => d.domain === emailDomain);

  return domain?.loginMethods ?? ['email'];
};
