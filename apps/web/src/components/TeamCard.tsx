import { ENTITY_PREFIX } from '../helpers/entityPrefix';
import { Team } from '../helpers/generated-api-client';
import Link from './Link';

export const TeamCard: React.FC<{ team: Team }> = ({ team }) => {
  return (
    <Link href={`${ENTITY_PREFIX}${team.preferredSlug}`}>
      <div className="shadow border bg-white text-black text-left flex flex-row hover:shadow-lg transition-all">
        {/* TODO: nicer missing profile pic image */}
        <img src={team.profilePic ?? 'https://upload.wikimedia.org/wikipedia/commons/4/48/No_image_%28male%29.svg'} alt="" className="aspect-square object-cover h-28" />
        <div className="py-2 px-3 min-w-0">
          <div className="text-xl mb-1.5">{team.name}</div>
          <div className="text-gray-600 whitespace-nowrap overflow-hidden text-ellipsis">{team.vision}</div>
        </div>
      </div>
    </Link>
  );
};

export const TeamCardGrid: React.FC<{ teams: Team[] }> = ({ teams }) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {teams.map((t) => <TeamCard key={t.id} team={t} />)}
    </div>
  );
};
