import { useRouter } from 'next/router';
import EntityPage from './entity';

const DynamicEntityPage = () => {
  const router = useRouter();
  const { entitySlug } = router.query;

  // Wait for router to be ready
  if (!router.isReady || !entitySlug) {
    return <div>Loading...</div>;
  }

  return <EntityPage entitySlug={entitySlug as string} />;
};

export default DynamicEntityPage;
