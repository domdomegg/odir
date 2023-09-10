import type { Env } from '../helpers/types';

const env: Env = {
  STAGE: 'local',

  CUSTOM_ODIR_DOMAIN: 'localhost:8000',

  API_BASE_URL: 'http://localhost:8001',

  STRIPE_PUBLISHABLE_KEY: 'pk_test_51KCByfI5VgKIYyWlqwp6p3qRFscr4s7bAaIC7EjZAunHLJEQoclC4it33M4Iv0U5jCVlDMQ0g8nMcJngVnIwjIOJ00vfxDTCMw',

  IMPERSONATION_LOGIN_ENABLED: true,
  GOOGLE_LOGIN_ENABLED: true,
  GOOGLE_LOGIN_CLIENT_ID: '480471114257-4vu9sclokbujb8l809o9jdlbn7qqlbs2.apps.googleusercontent.com',

  CLOUDFLARE_WEB_ANALYTICS_TOKEN_ODIR: undefined,
};

export default env;
