import Helmet from 'react-helmet';
import { useEffect, useState } from 'react';
import { Router } from '@gatsbyjs/reach-router';
import Page from '../components/Page';
import Footer from '../components/Footer';
import LoginPage, { EmailLoginCallbackPage, GoogleLoginCallbackPage, GovSsoLoginCallbackPage } from './login';
import { useAuthState } from '../helpers/networking';
import { TopNavigation } from '../components/Navigation';
import Section from '../components/Section';
import Alert from '../components/Alert';
import TeamsPage from './admin/teams';
import EntityPage from './entity';
import NewTeamPage from './new-team';
import NewPersonPage from './new-person';
import TasksPage from './admin/tasks';
import AuditPage from './admin/audit';
import UsersPage from './admin/users';
import UserPage from './admin/user';
import GroupPage from './admin/group';
import DebugPage from './admin/debug';
import NotFoundPage from './404';
import HomePage from './home';
import DomainPage from './admin/domain';
import NewEntityPage from './new';
import { OmniSearchBox } from '../components/OmniSearchBox';
import PrivacyPolicyPage from './privacy';
import { ENTITY_ORGANOGRAM_SUFFIX, ENTITY_PREFIX } from '../helpers/entityPrefix';
import EntityOrganogramPage from './entityOrganogram';

const IndexPage = () => {
  return (
    <Page className="flex flex-col">
      <Helmet>
        <title>
          Directory Navigator: Map your organization and its partners
        </title>
      </Helmet>

      <div className="flex-1">
        <IndexLayout />
      </div>
      <Footer />
    </Page>
  );
};

const IndexLayout: React.FC = () => {
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
    <>
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
      <Router basepath="/" className="text-left">
        <GoogleLoginCallbackPage path="/login-callback/google" />
        <GovSsoLoginCallbackPage path="/login-callback/gov-sso" />
        <EmailLoginCallbackPage path="/login-callback/email" />
        <PrivacyPolicyPage path="/policies/privacy" />

        {auth && (
          <>
            <HomePage path="/" />
            <EntityPage entitySlug="" path={`${ENTITY_PREFIX}:entitySlug`} />
            <EntityOrganogramPage entitySlug="" path={`${ENTITY_PREFIX}:entitySlug${ENTITY_ORGANOGRAM_SUFFIX}`} />
            <NewEntityPage path="/new" />
            <NewTeamPage path="/new/team" />
            <NewPersonPage path="/new/person" />
            <DebugPage path="/debug" />
            <TeamsPage path="/admin/teams" />
            <TasksPage path="/admin/tasks" />
            <AuditPage path="/admin/audit" />
            <UsersPage path="/admin/users" />
            <UserPage userId="" path="/admin/users/:userId" />
            <GroupPage groupId="" path="/admin/groups/:groupId" />
            <DomainPage domainId="" path="/admin/domains/:domainId" />
            <NotFoundPage default />
          </>
        )}

        {!auth && <LoginPage default />}
      </Router>
    </>
  );
};

export default IndexPage;
