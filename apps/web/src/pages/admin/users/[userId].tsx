import { useRouter } from 'next/router';
import UserPage from '../user';

const DynamicUserPage = () => {
  const router = useRouter();
  const { userId } = router.query;

  return <UserPage userId={userId as string} />;
};

export default DynamicUserPage;
