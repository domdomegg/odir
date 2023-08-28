import { RouteComponentProps } from '@gatsbyjs/reach-router';
import { useEffect } from 'react';
import { navigate } from 'gatsby';
import { useReq } from '../../helpers/networking';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import TeamPage from '../../components/TeamPage';
import Section from '../../components/Section';

const EntityPage: React.FC<RouteComponentProps & { entitySlug: string }> = ({ entitySlug }) => {
  const [entity, refetchEntity] = useReq('get /admin/entity/{entitySlug}', { entitySlug });

  useEffect(() => {
    if (entity.data?.type === 'team') {
      navigate(`/admin/${entity.data.team.preferredSlug}`);
    }
    if (entity.data?.type === 'person') {
      navigate(`/admin/${entity.data.person.preferredSlug}`);
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

  return <Section><h1>Entity not yet supported: {entity.data.type}</h1></Section>;
};

export default EntityPage;
