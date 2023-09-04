import { ChevronRightIcon } from '@heroicons/react/outline';
import classNames from 'classnames';
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
  title?: string,
  variant?: 'primary' | 'secondary'
}>;

export const ChevronListButton: React.FC<ChevronListButtonProps> = ({
  onClick, title, children, variant = 'primary'
}) => {
  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <Link
      onClick={onClick}
      className={classNames('p-4 transition-all flex items-center', {
        'bg-primary-600 hover:bg-primary-500 text-white': variant === 'primary',
        'bg-secondary-100 hover:bg-secondary-200': variant === 'secondary',
      })}
    >
      <div className="flex-1">
        {title && <h3 className="font-bold">{title}</h3>}
        <p>{children}</p>
      </div>
      <ChevronRightIcon className="h-5" />
    </Link>
  );
};
