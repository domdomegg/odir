import Link from 'next/link';
import { ReactNode } from 'react';

interface NextLinkProps {
  to: string;
  children: ReactNode;
  className?: string;
}

const NextLink: React.FC<NextLinkProps> = ({
  to, children, className, ...props
}) => {
  return (
    <Link href={to} className={className} {...props}>
      {children}
    </Link>
  );
};

export default NextLink;
