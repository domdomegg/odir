import { RouteComponentProps } from '@gatsbyjs/reach-router';
import { useReq } from '../../helpers/networking';
import Spinner from '../../components/Spinner';
import Alert from '../../components/Alert';
import TeamPage from '../../components/TeamPage';

const EntityPage: React.FC<RouteComponentProps & { entitySlug: string }> = ({ entitySlug }) => {
  const [entity, refetchEntity] = useReq('get /admin/entity/{entitySlug}', { entitySlug });

  if (entity.loading) {
    return <Spinner />;
  }

  if (entity.error) {
    return <Alert variant="error">{entity.error}</Alert>;
  }

  if (!entity.data) {
    return <Alert variant="error">Missing data</Alert>;
  }

  if (entity.data.type === 'team') {
    return <TeamPage data={entity.data} refetch={refetchEntity} />;
  }

  return <h1>Entity not yet supported: {entity.data.type}</h1>;
};

export default EntityPage;
