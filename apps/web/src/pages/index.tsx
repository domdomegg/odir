import Head from 'next/head';
import { useEffect, useState } from 'react';
import Page from '../components/Page';
import Footer from '../components/Footer';
import LoginPage from './login';
import { useAuthState } from '../helpers/networking';
import { TopNavigation } from '../components/Navigation';
import Section from '../components/Section';
import Alert from '../components/Alert';
import HomePage from './home';
import { OmniSearchBox } from '../components/OmniSearchBox';

const IndexPage = () => {
  const [auth] = useAuthState();
  const [logoutWarning, setLogoutWarning] = useState<string | undefined>();

  // This logs out the user when their access token expires
  useEffect(() => {
    if (typeof auth?.refreshToken.expiresAt !== 'number') return undefined;

    const msUntilExpiration = (auth.refreshToken.expiresAt * 1000) - Date.now();

    const warningTimeout = setTimeout(() => {
      setLogoutWarning('You will be logged out in the next minute');
    }, msUntilExpiration - 60_000);

    return () => {
      clearTimeout(warningTimeout);
    };
  }, [auth?.refreshToken.expiresAt]);

  // This ensures server-side rendering + hydration does not cause weirdness on these authenticated pages
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  if (!hasMounted) return null;

  return (
    <Page className="flex flex-col text-center">
      <Head>
        <title>
          Directory Navigator: Map your organization and its partners
        </title>
      </Head>

      <div className="flex-1">
        {auth && (
          <>
            <TopNavigation />
            <OmniSearchBox />
          </>
        )}
        {logoutWarning && auth && (
          <Section>
            <Alert variant="warning">{logoutWarning}</Alert>
          </Section>
        )}

        {auth ? <HomePage /> : <LoginPage />}
      </div>
      <Footer />
    </Page>
  );
};

export default IndexPage;
