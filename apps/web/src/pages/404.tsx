import { RouteComponentProps } from '@gatsbyjs/reach-router';

import Helmet from 'react-helmet';
import Page from '../components/Page';
import Section from '../components/Section';
import Logo from '../components/Logo';
import Button from '../components/Button';

const NotFoundPage: React.FC<RouteComponentProps> = () => (
  <Page>
    <Helmet>
      <meta name="robots" content="noindex" />
      <title>Directory Navigator: Page not found</title>
    </Helmet>
    <Section>
      <Logo className="my-8 w-24" />
      <h1 className="text-5xl sm:text-6xl font-odir-header font-black mb-8">Page not found</h1>
      <p>We couldn't find the page you requested.</p>
      <Button href="/" className="inline-block mt-4">View homepage</Button>
    </Section>
  </Page>
);

export default NotFoundPage;
