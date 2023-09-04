import Link from './Link';

export type BreadcrumbItem = {
  id: string,
  name: string,
  preferredSlug: string,
};

export const Breadcrumbs: React.FC<{ parentChain: BreadcrumbItem[], directParents: BreadcrumbItem[] }> = ({ parentChain, directParents }) => {
  if (directParents.length > 1 || parentChain.length === 1) {
    return (
      <div>
        Part of {directParents.flatMap((b, i) => {
        const crumb = <Breadcrumb key={b.id} item={b} />;

        return (i === 0) ? [crumb] : [' and ', crumb];
      })}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {parentChain.flatMap((b, i) => {
        const crumb = <Breadcrumb key={b.id} item={b} />;

        return (i === 0) ? [crumb] : ['/', crumb];
      })}
    </div>
  );
};

const Breadcrumb: React.FC<{ item: BreadcrumbItem }> = ({ item }) => {
  return (
    <Link href={`/${item.preferredSlug}`} className="underline">
      {item.name}
    </Link>
  );
};
