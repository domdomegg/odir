import classNames from 'classnames';
import Link from './Link';

interface Props {
  href?: string,
  target?: React.HTMLAttributeAnchorTarget,
  onClick?: React.EventHandler<React.MouseEvent | React.KeyboardEvent>,
  variant?: 'primary' | 'secondary' | 'error',
  size?: 'normal' | 'small' | 'large',
  className?: string,
  disabled?: boolean,
  children?: React.ReactNode,
}

const Button: React.FC<Props> = ({
  children, href, target, onClick, variant = 'primary', size = 'normal', className, disabled, ...other
}) => (
  <Link
    href={href}
    target={target}
    onClick={onClick}
    className={classNames('Button', {
      'bg-primary-600 border-primary-600 hover:bg-primary-500 hover:border-primary-500 focus:bg-primary-500 focus:border-primary-500 active:bg-primary-700 active:border-primary-700': variant === 'primary',
      'bg-secondary-600 border-secondary-600 hover:bg-secondary-500 hover:border-secondary-500 focus:bg-secondary-500 focus:border-secondary-500 active:bg-secondary-700 active:border-secondary-700': variant === 'secondary',
      'bg-error-600 border-error-600 hover:bg-error-500 hover:border-error-500 focus:bg-error-500 focus:border-error-500 active:bg-error-700 active:border-error-700': variant === 'error',
      'px-2 py-0': size === 'small',
      'border-4': size === 'normal',
      'border-4 py-2 px-5 text-[130%]': size === 'large',
    }, className)}
    disabled={disabled}
    role="button"
    {...other}
  >
    <span className="inline-block">{children}</span>
  </Link>
);

export default Button;
