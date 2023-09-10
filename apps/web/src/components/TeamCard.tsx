import { withAssetPrefix } from 'gatsby';
import { ENTITY_PREFIX } from '../helpers/entityPrefix';
import { Team } from '../helpers/generated-api-client';
import Link from './Link';

export const TeamCard: React.FC<{ team: Team }> = ({ team }) => {
  return (
    <Link href={`${ENTITY_PREFIX}${team.preferredSlug}`}>
      <div className="shadow border bg-white text-black text-left flex flex-row hover:shadow-md transition-all">
        <img src={team.profilePic ?? withAssetPrefix('/shared/images/missing-team-avatar.svg')} alt="" className="aspect-square object-cover h-28" />
        <div className="py-2 px-3 min-w-0 border-l">
          <div className="text-xl mb-1.5">{team.name}</div>
          <div className="text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">{team.vision}</div>
        </div>
      </div>
    </Link>
  );
};

export const TeamCardGrid: React.FC<{ teams: Team[] }> = ({ teams }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {teams.map((t) => <TeamCard key={t.id} team={t} />)}
    </div>
  );
};
