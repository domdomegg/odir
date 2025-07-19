import { useRouter } from 'next/router';
import GroupPage from '../group';

const DynamicGroupPage = () => {
  const router = useRouter();
  const { groupId } = router.query;

  return <GroupPage groupId={groupId as string} />;
};

export default DynamicGroupPage;
