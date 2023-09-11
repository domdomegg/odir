import { useAuthState, useReq } from '../helpers/networking';
import Link, { LinkProps } from './Link';

export const RequestFormLink: React.FC<{ message: string } & Omit<LinkProps, 'href' | 'target'>> = ({ message, children, ...rest }) => {
  const [auth] = useAuthState();
  const [profile] = useReq('get /admin/login', { manual: !auth });

  return (
    <Link href={`https://docs.google.com/forms/d/e/1FAIpQLSfyTo0o2GFKXjlEMruQ5wOoZzk7BTGj1Cid9Sn1y_jr5OGG9w/viewform?usp=pp_url${profile.data ? `&entry.1067549717=${profile.data.email}` : ''}&entry.2039021325=${encodeURIComponent(message)}`} target="_blank" {...rest}>{children}</Link>
  );
};
