import { execSync } from 'child_process';
import { GatsbyConfig } from 'gatsby';
import env from './src/env/env';

const getVersion = () => {
  const hash = execSync('git rev-parse --short HEAD', { encoding: 'utf-8' });
  return `${(new Date()).toISOString().replace(/-/g, '').replace(/\..*/, '')
    .replace(/:/g, '')
    .replace('T', '.')}.${hash.trim()}`;
};

/** @type {import('gatsby').GatsbyConfig} */
const config: GatsbyConfig = {
  // Always use the main site as the canonical one and where to get assets
  // This helps keep things consistent, and allows us hosting subfolders (as we do for Cambridge)
  assetPrefix: `https://${env.CUSTOM_ODIR_DOMAIN}`,
  siteMetadata: {
    title: 'Directory Navigator',
    description: 'Directory Navigator helps organizations map themselves and their partners.',
    siteUrl: `https://${env.CUSTOM_ODIR_DOMAIN}/`,
    author: {
      name: 'Odir',
      url: `https://${env.CUSTOM_ODIR_DOMAIN}/`,
    },
    version: getVersion(),
    // Really this should be `?? undefined` but then Gatsby complains
    cloudflareWebAnalyticsToken: env.CLOUDFLARE_WEB_ANALYTICS_TOKEN_ODIR ?? '',
  },
  plugins: [
    {
      resolve: 'gatsby-plugin-canonical-urls',
      options: {
        siteUrl: `https://${env.CUSTOM_ODIR_DOMAIN}/`,
      },
    },
    'gatsby-plugin-typescript',
    'gatsby-plugin-react-helmet',
    'gatsby-plugin-postcss',
  ],
  jsxRuntime: 'automatic',
};

export default config;
