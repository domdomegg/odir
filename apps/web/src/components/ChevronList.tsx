import { ChevronRightIcon } from '@heroicons/react/outline';
import Link from './Link';

export const ChevronList: React.FC<React.PropsWithChildren> = ({ children }) => {
  return (
    <div className="flex flex-col gap-4">
      {children}
    </div>
  );
};

export type ChevronListButtonProps = React.PropsWithChildren<{
  onClick: () => void,
  title: string,
}>;

export const ChevronListButton: React.FC<ChevronListButtonProps> = ({ onClick, title, children }) => {
  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <Link onClick={onClick} className="p-4 bg-gray-100 hover:bg-gray-200 transition-all flex items-center">
      <div className="flex-1">
        <h3 className="font-bold">{title}</h3>
        <p>{children}</p>
      </div>
      <ChevronRightIcon className="h-5" />
    </Link>
  );
};
