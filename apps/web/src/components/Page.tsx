import Helmet from 'react-helmet';
import classNames from 'classnames';
import { withAssetPrefix, useStaticQuery, graphql } from 'gatsby';
import env from '../env/env';

const Page: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => {
  // See gatsby-config.ts
  const { site } = useStaticQuery(graphql`query { site { siteMetadata { version, cloudflareWebAnalyticsToken, description } } }`);

  return (
    <>
      <Helmet htmlAttributes={{ lang: 'en' }}>
        {env.STAGE !== 'prod' && <meta name="robots" content="noindex" />}
        <link rel="apple-touch-icon" sizes="180x180" href={withAssetPrefix('/shared/favicon/apple-touch-icon.png')} />
        <link rel="icon" type="image/png" sizes="32x32" href={withAssetPrefix('/shared/favicon/favicon-32x32.png')} />
        <link rel="icon" type="image/png" sizes="16x16" href={withAssetPrefix('/shared/favicon/favicon-16x16.png')} />
        <link rel="manifest" href={withAssetPrefix('/shared/favicon/site.webmanifest')} />
        <link rel="mask-icon" href={withAssetPrefix('/shared/favicon/safari-pinned-tab.svg')} color="#d56d0b" />
        <link rel="shortcut icon" href={withAssetPrefix('/shared/favicon/favicon.ico')} />
        <meta name="msapplication-TileColor" content="#d56d0b" />
        <meta name="msapplication-config" content={withAssetPrefix('/shared/favicon/browserconfig.xml')} />
        <meta name="theme-color" content="#ffffff" />
        <meta property="og:image" content={withAssetPrefix('/shared/images/og-image.png')} />
        <meta property="og:description" content={site.siteMetadata.description} />
        <meta property="odir-version" content={site.siteMetadata.version} />
        {site.siteMetadata.cloudflareWebAnalyticsToken && <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={`{"token": "${site.siteMetadata.cloudflareWebAnalyticsToken}"}`} />}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet" />
      </Helmet>
      <div className={classNames('font-odir-content bg-primary-50 font-normal text-center overflow-auto min-h-screen', className)}>
        {children}
      </div>
    </>
  );
};

export default Page;
