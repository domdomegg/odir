import type { AppProps } from 'next/app';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import '../styles/global.css';
import Page from '../components/Page';
import Footer from '../components/Footer';
import { TopNavigation } from '../components/Navigation';
import { OmniSearchBox } from '../components/OmniSearchBox';
import { useAuthState } from '../helpers/networking';

const App = ({ Component, pageProps }: AppProps) => {
  const router = useRouter();
  const [auth] = useAuthState();

  // Pages that handle their own layout (like index page)
  const pagesWithOwnLayout = ['/', '/login'];
  const shouldUseAppLayout = !pagesWithOwnLayout.includes(router.pathname);

  // This ensures server-side rendering + hydration does not cause weirdness on these authenticated pages
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);
  if (!hasMounted) return null;

  if (!shouldUseAppLayout) {
    return <Component {...pageProps} />;
  }

  return (
    <Page className="flex flex-col">
      <div className="flex-1">
        {auth && (
          <>
            <TopNavigation />
            <OmniSearchBox />
          </>
        )}
        <Component {...pageProps} />
      </div>
      <Footer />
    </Page>
  );
};

export default App;
