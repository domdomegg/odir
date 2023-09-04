import { ENTITY_PREFIX } from '../helpers/entityPrefix';
import { Person, Relation, Team } from '../helpers/generated-api-client';
import Link from './Link';

export const PersonCard: React.FC<{ person: Person, relations: Relation[], team: Team }> = ({ person, relations, team }) => {
  const teamMemberRelation = relations.find((r) => r.type === 'MEMBER_OF' && r.childId === person.id && r.parentId === team.id);
  const teamManagerRelation = relations.find((r) => r.type === 'MANAGER_OF' && r.childId === person.id && r.parentId === team.id);

  return (
    <Link href={`${ENTITY_PREFIX}${person.preferredSlug}`}>
      <div className="shadow border bg-white text-black text-center flex flex-col hover:shadow-lg transition-all">
        {/* TODO: nicer missing profile pic image */}
        <img src={person.profilePic ?? 'https://upload.wikimedia.org/wikipedia/commons/4/48/No_image_%28male%29.svg'} alt="" className="aspect-square object-cover" />
        {teamManagerRelation && <div className="text-xs p-0.5 bg-purple-500 text-white font-bold">Manages this team</div>}
        <div className="p-2">
          <div className="text-xl">{person.name}</div>
          <div className="text-gray-600">{teamMemberRelation?.title ?? person.jobTitle}</div>
        </div>
      </div>
    </Link>
  );
};

export const PersonCardGrid: React.FC<{ persons: Person[], relations: Relation[], team: Team }> = ({ persons, relations, team }) => {
  return (

    <div className="grid grid-cols-4 gap-4">
      {persons.map((p) => <PersonCard key={p.id} person={p} relations={relations} team={team} />)}
    </div>
  );
};
