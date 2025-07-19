import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useReq } from '../helpers/networking';
import Spinner from '../components/Spinner';
import Alert from '../components/Alert';
import Section from '../components/Section';
import { ENTITY_ORGANOGRAM_SUFFIX, ENTITY_PREFIX } from '../helpers/entityPrefix';
import TeamOrganogramPage from '../components/TeamOrganogramPage';

const EntityOrganogramPage: React.FC<{ entitySlug: string }> = ({ entitySlug }) => {
  const router = useRouter();
  const [entity, refetchEntity] = useReq('get /admin/entity/{entitySlug}', { entitySlug });

  // Redirect to the preferred slug, if not already on it.
  useEffect(() => {
    if (!entity.data) {
      return;
    }

    const newUrl = `${ENTITY_PREFIX}${
      // eslint-disable-next-line no-nested-ternary
      entity.data.type === 'team' ? entity.data.team.preferredSlug
        : entity.data.type === 'person' ? entity.data.person.preferredSlug
          : ''}${ENTITY_ORGANOGRAM_SUFFIX}/`;
    if (newUrl !== window.location.pathname) {
      router.replace(newUrl);
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
    return <TeamOrganogramPage data={entity.data} refetch={refetchEntity} />;
  }

  if (entity.data.type === 'person') {
    // TODO: add support for organograms based on people?
    return <Section><h1>Entity not yet supported: {(entity.data as { type: string }).type}</h1></Section>;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const ensureNever: never = entity.data;
  return <Section><h1>Entity not yet supported: {(entity.data as { type: string }).type}</h1></Section>;
};

export default EntityOrganogramPage;
