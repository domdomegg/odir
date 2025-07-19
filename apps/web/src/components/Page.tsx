import Head from 'next/head';
import { clsx } from 'clsx';
import env from '../env/env';

const Page: React.FC<React.PropsWithChildren<{ className?: string }>> = ({ children, className }) => {
  return (
    <>
      <Head>
        <html lang="en" />
        {env.STAGE !== 'prod' && <meta name="robots" content="noindex" />}
        <link rel="apple-touch-icon" sizes="180x180" href="/shared/favicon/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/shared/favicon/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/shared/favicon/favicon-16x16.png" />
        <link rel="manifest" href="/shared/favicon/site.webmanifest" />
        <link rel="mask-icon" href="/shared/favicon/safari-pinned-tab.svg" color="#d56d0b" />
        <link rel="shortcut icon" href="/shared/favicon/favicon.ico" />
        <meta name="msapplication-TileColor" content="#d56d0b" />
        <meta name="msapplication-config" content="/shared/favicon/browserconfig.xml" />
        <meta name="theme-color" content="#ffffff" />
        <meta property="og:image" content="/shared/images/og-image.png" />
        {env.CLOUDFLARE_WEB_ANALYTICS_TOKEN_ODIR && <script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon={`{"token": "${env.CLOUDFLARE_WEB_ANALYTICS_TOKEN_ODIR}"}`} />}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Lato:wght@400;700&display=swap" rel="stylesheet" />
      </Head>
      <div className={clsx('font-odir-content bg-primary-50 font-normal overflow-auto min-h-screen', className)}>
        {children}
      </div>
    </>
  );
};

export default Page;
