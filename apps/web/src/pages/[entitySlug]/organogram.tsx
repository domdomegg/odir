import { useRouter } from 'next/router';
import EntityOrganogramPage from '../entityOrganogram';

const DynamicEntityOrganogramPage = () => {
  const router = useRouter();
  const { entitySlug } = router.query;

  // Wait for router to be ready
  if (!router.isReady || !entitySlug) {
    return <div>Loading...</div>;
  }

  return <EntityOrganogramPage entitySlug={entitySlug as string} />;
};

export default DynamicEntityOrganogramPage;
