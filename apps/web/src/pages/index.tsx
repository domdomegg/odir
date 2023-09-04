import Helmet from 'react-helmet';
import { useEffect, useState } from 'react';
import { Router } from '@gatsbyjs/reach-router';
import Page from '../components/Page';
import Footer from '../components/Footer';
import { EmailLoginCallbackPage, GoogleLoginCallbackPage, LoginPage } from './admin/login';
import { useAuthState } from '../helpers/networking';
import Navigation from '../components/Navigation';
import Section from '../components/Section';
import Alert from '../components/Alert';
import TeamsPage from './admin/teams';
import EntityPage from './admin/entity';
import NewTeamPage from './admin/new-team';
import NewPersonPage from './admin/new-person';
import TasksPage from './admin/tasks';
import AuditPage from './admin/audit';
import UsersPage from './admin/users';
import UserPage from './admin/user';
import GroupPage from './admin/group';
import ProfilePage from './admin/profile';
import NotFoundPage from './404';

const IndexPage = () => {
  return (
    <Page className="flex flex-col">
      <Helmet>
        <title>
          Directory Navigator: Map your organization and its partners
        </title>
        <meta
          property="og:title"
          content="Directory Navigator: Map your organization and its partners"
        />
      </Helmet>

      <div className="flex-1">
        <IndexLayout />
      </div>
      <Footer />
    </Page>
  );
};

const IndexLayout: React.FC = () => {
  const [auth, setAuth] = useAuthState();
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
    <>
      {auth && (
        <Navigation
          left={[
            { text: 'Home', href: '/' },
            { text: 'Profile', href: '/profile' },
          ]}
          right={[
            { text: 'Logout', onClick: () => setAuth() },
          ]}
        />
      )}
      {logoutWarning && auth && (
        <Section>
          <Alert variant="warning">{logoutWarning}</Alert>
        </Section>
      )}
      <Router basepath="/" className="text-left">
        <GoogleLoginCallbackPage path="/login-callback/google" />
        <EmailLoginCallbackPage path="/login-callback/email" />

        {auth && (
          <>
            <TeamsPage path="/" />
            <EntityPage entitySlug="" path="/:entitySlug" />
            <NewTeamPage path="/new-team" />
            <NewPersonPage path="/new-person" />
            <TasksPage path="/tasks" />
            <AuditPage path="/audit" />
            <UsersPage path="/users" />
            <UserPage userId="" path="/users/:userId" />
            <GroupPage groupId="" path="/groups/:groupId" />
            <ProfilePage path="/profile" />
            <NotFoundPage default />
          </>
        )}

        {!auth && <LoginPage default />}
      </Router>
    </>
  );
};

export default IndexPage;
