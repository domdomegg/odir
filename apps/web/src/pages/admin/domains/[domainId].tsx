import { useRouter } from 'next/router';
import DomainPage from '../domain';

const DynamicDomainPage = () => {
  const router = useRouter();
  const { domainId } = router.query;

  return <DomainPage domainId={domainId as string} />;
};

export default DynamicDomainPage;
