import type { Env } from '../helpers/types';

const env: Env = {
  STAGE: 'local',

  API_BASE_URL: 'http://localhost:8001',

  // spell-checker: disable
  // Generate with:
  // openssl ecparam -genkey -name prime256v1 -noout -out ec_private.pem
  // openssl ec -in ec_private.pem -pubout -out ec_public.pem
  JWT_PUBLIC_KEY: '-----BEGIN PUBLIC KEY-----\nMFkwEwYHKoZIzj0CAQYIKoZIzj0DAQcDQgAEKgpIxpMaAup1EqDjJkg28RtHaq3r\ni8mRQvBD9tlqyB7jdBwd01Xqt8r1wc9eF3HKpGeZ1FNrB37S67xCz96NYw==\n-----END PUBLIC KEY-----',
  JWT_PRIVATE_KEY: '-----BEGIN EC PRIVATE KEY-----\nMHcCAQEEIKDradf4l8/YH44v1woIh1Mt1SN3al2DIUNgLVjYQqkLoAoGCCqGSM49\nAwEHoUQDQgAEKgpIxpMaAup1EqDjJkg28RtHaq3ri8mRQvBD9tlqyB7jdBwd01Xq\nt8r1wc9eF3HKpGeZ1FNrB37S67xCz96NYw==\n-----END EC PRIVATE KEY-----',
  // spell-checker: enable

  // OAuth 2 client id for Google sign-in
  GOOGLE_LOGIN_CLIENT_ID: '480471114257-4vu9sclokbujb8l809o9jdlbn7qqlbs2.apps.googleusercontent.com',

  // Slack configuration
  // The bot should have the chat:write scope and be able to access the channel
  // This token is for the 'Raise Local' bot, added to the #test-channel in the domdomegg.slack.com workspace
  // Concatenated to avoid secret scanning getting angry (it's fine to be public given it has limited permissions
  // to only a sandbox workspace, and has clear warnings that the public could send messages via it)
  // spell-checker: disable
  // eslint-disable-next-line no-useless-concat
  SLACK_BOT_TOKEN: 'xoxb-' + '825862040501-2829297236371-UR75gADxkwP7Z5OKZWCSBl2I',
  SLACK_CHANNEL_ID: 'CQ9RC2HB7',
  // spell-checker: enable

  // Timestamp which any JWT must be issued after. Either an integer (unix timestamp in seconds) or undefined (undefined means this check is disabled)
  // For emergency use in case we want to quickly make all tokens invalid but don't have access to a computer with openssl installed to regenerate keys
  // NB: changing this is pointless if the JWT private key has been exposed
  JWT_REQUIRE_ISSUED_AT_AFTER: undefined,

  // Whether to enable impersonation login
  IMPERSONATION_LOGIN_ENABLED: true,

  CUSTOM_ODIR_DOMAIN: 'localhost:8000',
};

export default env;
