import { fixedGroups } from '@odir/shared';
import { createHash } from 'crypto';
import createHttpError from 'http-errors';
import jwt from 'jsonwebtoken';
import env from '../env/env';
import { LoginResponse, Ulid, User } from '../schemas';
import { insertAudit, scan } from './db';
import { domainTable, userTable } from './tables';
import { AccessTokenPayload, RefreshTokenPayload } from './types';

export const login = async (email: string): Promise<LoginResponse> => {
  const now = Math.floor(new Date().getTime() / 1000);
  const groups = await getGroups(email);

  await insertAudit({
    object: email,
    action: 'login',
  });

  const authTokenPayload: AccessTokenPayload = {
    subject: email,
    groups,
    iat: now,
    exp: now + 3600, // 1 hour
  };

  const refreshTokenPayload: RefreshTokenPayload = {
    subject: email,
    iat: now,
    exp: now + 3600 * 24, // 1 day
  };

  return {
    accessToken: {
      value: jwt.sign(
        authTokenPayload,
        env.JWT_PRIVATE_KEY,
        { algorithm: 'ES256' },
      ),
      expiresAt: authTokenPayload.exp,
    },
    refreshToken: {
      value: jwt.sign(
        refreshTokenPayload,
        env.JWT_PRIVATE_KEY,
        { algorithm: 'ES256' },
      ),
      expiresAt: refreshTokenPayload.exp,
    },
    groups,
  };
};

const SECURITY_TRAINING_VALIDITY_IN_SECONDS = 31556952; // 1 year

// Map from SHA1_hex(lowercase Google account email) to use definition
// We use hashes to avoid checking-in people's personal emails to the repo
const HARD_CODED_USER_MAP: Record<string, Omit<User, 'id' | 'email'> | undefined> = {
  '715ec86cfb0e42b3f41aec77fa7b4a8441128d5e': {
    name: 'Adam Jones',
    groups: [fixedGroups.Admin, fixedGroups.Allowlisted],
    securityTrainingCompletedAt: new Date('2023-01-02T18:47:46Z').getTime() / 1000,
  },
};

/**
 * This should only be used for login. In other places, we should be getting groups from the decoded JWT
 * @returns array of group ids for a given email
 * */
const getGroups = async (email: string): Promise<Ulid[]> => {
  const usersFromDb = await scan(userTable);
  const user = usersFromDb.find((u) => u.email === email) ?? HARD_CODED_USER_MAP[createHash('sha1').update(email.toLowerCase()).digest('hex')];
  const emailParts = email.split('@');
  const emailDomain = emailParts[emailParts.length - 1];
  const domainsFromDb = await scan(domainTable);
  const domain = domainsFromDb.find((d) => d.domain === emailDomain);

  const resolvedGroups = [...(user?.groups ?? []), ...(domain?.groups ?? [])];
  if (!resolvedGroups.includes(fixedGroups.Allowlisted)) {
    throw new createHttpError.Forbidden(`Your account, ${email}, has not yet been given access to the platform (requires allowlisting). Contact support (see footer) with details about who you are to get an invite.`);
  }

  const needsSecurityTraining = resolvedGroups.includes(fixedGroups.Admin);
  const securityTrainingOutdated = user && (user.securityTrainingCompletedAt + SECURITY_TRAINING_VALIDITY_IN_SECONDS < new Date().getTime() / 1000);
  if (needsSecurityTraining && securityTrainingOutdated) {
    throw new createHttpError.Forbidden(`Security training for ${email} out of date, last marked completed on ${new Date(user.securityTrainingCompletedAt * 1000)}`);
  }

  return resolvedGroups;
};
