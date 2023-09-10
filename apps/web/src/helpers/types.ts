export interface Env {
  STAGE: 'local' | 'dev' | 'prod',

  CUSTOM_ODIR_DOMAIN: string,

  API_BASE_URL: string,

  /** OAuth 2 client id for Google sign-in. */
  GOOGLE_LOGIN_CLIENT_ID: string,

  /** API token to configure Cloudflare Web Analytics for the Odir site */
  CLOUDFLARE_WEB_ANALYTICS_TOKEN_ODIR: string | undefined,
}
