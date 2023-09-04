import Helmet from 'react-helmet';
import { Router } from '@gatsbyjs/reach-router';
import { useEffect, useState } from 'react';
import Page from '../../components/Page';
import TeamsPage from './teams';
import ProfilePage from './profile';
import TasksPage from './tasks';
import NotFoundPage from '../404';
import Navigation from '../../components/Navigation';
import { useAuthState } from '../../helpers/networking';
import Alert from '../../components/Alert';
import Section from '../../components/Section';
import AuditPage from './audit';
import UsersPage from './users';
import UserPage from './user';
import GroupPage from './group';
import EntityPage from './entity';
import NewTeamPage from './new-team';
import NewPersonPage from './new-person';

const IndexPage = () => (
  <Page className="pb-8">
    <Helmet>
      <title>Directory Navigator</title>
      <meta property="og:title" content="Raise Admin" />
      <meta name="robots" content="noindex" />
    </Helmet>
    <IndexLayout />
  </Page>
);

const IndexLayout = () => {
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
            { text: 'Teams', href: '/admin/' },
            { text: 'Tasks', href: '/admin/tasks' },
            { text: 'Audit', href: '/admin/audit' },
            { text: 'Users', href: '/admin/users' },
            { text: 'Profile', href: '/admin/profile' },
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
      <Router basepath="/admin" className="text-left">
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
      </Router>
    </>
  );
};

export default IndexPage;
