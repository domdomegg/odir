import { clsx } from 'clsx';
import React from 'react';

interface Props {
  id?: string,
  className?: string,
}

export const SectionNoPadding = React.forwardRef<HTMLElement, React.PropsWithChildren<Props>>(({ children, id, className }, ref) => <section ref={ref} id={id} className={clsx('SectionNoPadding', className)}>{children}</section>);

const Section = React.forwardRef<HTMLElement, React.PropsWithChildren<Props>>(({ id, children, className }, ref) => <SectionNoPadding ref={ref} id={id} className={clsx('Section', className)}>{children}</SectionNoPadding>);

export const SectionTitle: React.FC<React.PropsWithChildren<Props>> = ({ children, id, className }) => <h2 id={id} className={clsx('text-3xl sm:text-5xl font-odir-header font-black mb-4', className)}>{children}</h2>;

export default Section;
