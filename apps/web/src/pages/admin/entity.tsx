import { RouteComponentProps } from '@gatsbyjs/reach-router';
import { useEffect } from 'react';
import { navigate } from 'gatsby';
import { useReq } from '../../helpers/networking';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import TeamPage from '../../components/TeamPage';
import Section from '../../components/Section';
import PersonPage from '../../components/PersonPage';

const EntityPage: React.FC<RouteComponentProps & { entitySlug: string }> = ({ entitySlug }) => {
  const [entity, refetchEntity] = useReq('get /admin/entity/{entitySlug}', { entitySlug });

  // Redirect to the preferred slug, if not already on it.
  useEffect(() => {
    if (!entity.data) {
      return;
    }

    const newUrl = `/admin/${
      // eslint-disable-next-line no-nested-ternary
      entity.data.type === 'team' ? entity.data.team.preferredSlug
        : entity.data.type === 'person' ? entity.data.person.preferredSlug
          : ''}/`;
    if (newUrl !== window.location.pathname) {
      navigate(newUrl, { replace: true });
    }
  }, [entity.data]);

  if (entity.loading) {
    return <Section><Spinner /></Section>;
  }

  if (entity.error) {
    return <Section><Alert variant="error">{entity.error}</Alert></Section>;
  }

  if (!entity.data) {
    return <Section><Alert variant="error">Missing data</Alert></Section>;
  }

  if (entity.data.type === 'team') {
    return <TeamPage data={entity.data} refetch={refetchEntity} />;
  }

  if (entity.data.type === 'person') {
    return <PersonPage data={entity.data} refetch={refetchEntity} />;
  }

  return <Section><h1>Entity not yet supported: {entity.data.type}</h1></Section>;
};

export default EntityPage;
