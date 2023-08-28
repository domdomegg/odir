import {
  CheckIcon,
  ChevronRightIcon, PencilIcon, PlusSmIcon, TrashIcon
} from '@heroicons/react/outline';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import Section, { SectionTitle } from './Section';
import {
  EntityResponse, Person, Relation, SearchResponse, Slug, Team, TeamEdits
} from '../helpers/generated-api-client';
import Link from './Link';
import Button from './Button';
import Modal from './Modal';
import { Form } from './Form';
import { useRawReq } from '../helpers/networking';
import { SearchBox } from './SearchBox';

const TeamPage: React.FC<{ data: EntityResponse & { type: 'team' }, refetch: () => Promise<unknown> }> = ({
  data: {
    team, breadcrumbs, relations, teams, persons, slugs, hasDetailedAccess
  }, refetch
}) => {
  const parentTeams = relations.filter((r) => r.type === 'PART_OF' && r.childId === team.id).map((r) => {
    const parentTeam = teams.find((t) => t.id === r.parentId);
    if (!parentTeam) throw new Error(`Team ${r.parentId} was parent of team ${r.childId} (relation ${r.id}) but not provided to TeamAbout component.`);
    return parentTeam;
  });

  const [showEditModal, setShowEditModal] = useState(false);

  return (
    <Section>
      <div className="flex">
        <div className="flex-1">
          <Breadcrumbs breadcrumbs={breadcrumbs} parentTeams={parentTeams} />
          <SectionTitle>{team.name}</SectionTitle>
          {/* TODO: convert user id to user name */}
          {/* <p className="-mt-2 mb-2 text-gray-600">Last edited by {team.lastEditedBy} <ReactTimeago date={team.lastEditedAt * 1000} /></p> */}
        </div>
        <div>
          <div>
            <Button onClick={() => setShowEditModal(true)}><PencilIcon className="h-5 mb-0.5 mr-0.5" /> Edit team</Button>
          </div>
        </div>
      </div>
      <TeamPersons persons={persons} relations={relations} team={team} />
      <h2 className="font-raise-header text-3xl font-bold mt-6 mb-1">Teams</h2>
      <TeamTeams teams={teams} relations={relations} team={team} />
      <h2 className="font-raise-header text-3xl font-bold mt-6 mb-1">About</h2>
      <TeamAbout team={team} />
      <TeamEditorModal open={showEditModal} onClose={() => setShowEditModal(false)} team={team} relations={relations} teams={teams} persons={persons} slugs={slugs} hasDetailedAccess={hasDetailedAccess} refetch={refetch} />
    </Section>
  );
};

const Breadcrumbs: React.FC<{ breadcrumbs: Team[], parentTeams: Team[] }> = ({ breadcrumbs, parentTeams }) => {
  if (parentTeams.length > 1 || breadcrumbs.length === 1) {
    return (
      <div>
        Part of {parentTeams.flatMap((b, i) => {
        const crumb = <Breadcrumb breadcrumb={b} />;

        return (i === 0) ? [crumb] : [' and ', crumb];
      })}
      </div>
    );
  }

  return (
    <div className="flex gap-2">
      {breadcrumbs.flatMap((b, i) => {
        const crumb = <Breadcrumb breadcrumb={b} />;

        return (i === 0) ? [crumb] : ['/', crumb];
      })}
    </div>
  );
};

const Breadcrumb: React.FC<{ breadcrumb: Team }> = ({ breadcrumb }) => {
  return (
    <Link href={`/admin/${breadcrumb.preferredSlug}`} className="underline">
      {breadcrumb.name}
    </Link>
  );
};

const TeamPersons: React.FC<{ persons: Person[], relations: Relation[], team: Team }> = ({ persons, relations, team }) => {
  if (!persons.length) {
    // TODO: link to add one
    return <div className="-mt-2">There are no people on this team.</div>;
  }

  return (
    <div className="grid grid-cols-4 gap-4">
      {persons.map((p) => <PersonCard person={p} relations={relations} team={team} />)}
      {/* TODO: add new card */}
    </div>
  );
};

const PersonCard: React.FC<{ person: Person, relations: Relation[], team: Team }> = ({ person, relations, team }) => {
  const teamMemberRelation = relations.find((r) => r.type === 'MEMBER_OF' && r.childId === person.id && r.parentId === team.id);
  const teamManagerRelation = relations.find((r) => r.type === 'MANAGER_OF' && r.childId === person.id && r.parentId === team.id);

  return (
    <Link href={`/admin/${person.preferredSlug}`}>
      <div className="shadow border text-black text-center flex flex-col hover:shadow-lg transition-all">
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

const TeamTeams: React.FC<{ teams: Team[], relations: Relation[], team: Team }> = ({ teams, relations, team }) => {
  const subTeams = relations.filter((r) => r.type === 'PART_OF' && r.parentId === team.id).map((r) => {
    const subTeam = teams.find((t) => t.id === r.childId);
    if (!subTeam) throw new Error(`Team ${r.childId} was child of team ${r.parentId} (relation ${r.id}) but not provided to TeamTeams component.`);
    return subTeam;
  });

  if (!subTeams.length) {
    // TODO: link to add one
    return <div>This team has no sub-teams.</div>;
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {subTeams.map((t) => <TeamCard team={t} />)}
    </div>
  );
};

const TeamCard: React.FC<{ team: Team }> = ({ team }) => {
  return (
    <Link href={`/admin/${team.preferredSlug}`}>
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

const TeamAbout: React.FC<{ team: Team }> = ({
  team
}) => {
  return (
    <div className="flex flex-col gap-4">
      {team.vision && (
      <div>
        <p className="font-bold">Vision</p>
        <p>{team.vision}</p>
      </div>
      )}
      {team.mission && (
      <div>
        <p className="font-bold">Mission</p>
        <p>{team.mission}</p>
      </div>
      )}
      {team.priorities && (
      <div>
        <p className="font-bold">Priorities</p>
        <p>{team.priorities}</p>
      </div>
      )}
      {team.notes && (
      <div>
        <p className="font-bold">Notes</p>
        <p>{team.notes}</p>
      </div>
      )}
      {team.website && (
      <div>
        <p className="font-bold">Website</p>
        <Link href={team.website} className="text-blue-800 underline">{team.website}</Link>
      </div>
      )}
    </div>
  );
};

const TeamEditorModal: React.FC<{ open: boolean, onClose: () => void, team: Team, relations: Relation[], teams: Team[], persons: Person[], slugs: Slug[], hasDetailedAccess: boolean, refetch: () => Promise<unknown> }> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  open, onClose, team, relations, teams, persons, slugs, hasDetailedAccess, refetch
}) => {
  const [editorType, setEditorType] = useState<undefined | 'details' | 'members' | 'children' | 'parents' | 'slugs'>();
  const req = useRawReq();
  const internalOnClose = async () => {
    setEditorType(undefined);
    await refetch();
    onClose();
  };

  if (!open) {
    return null;
  }

  let contents: JSX.Element;
  if (editorType === 'details') {
    contents = (
      <Form<TeamEdits>
        title="Edit team details"
        definition={{
          name: { label: 'Name', inputType: 'text' },
          vision: { label: 'Vision', inputType: 'textarea' },
          mission: { label: 'Mission', inputType: 'textarea' },
          priorities: { label: 'Priorities', inputType: 'textarea' },
          website: { label: 'Website', inputType: 'text' },
          profilePic: { label: 'Profile picture', inputType: 'text' },
        }}
        initialValues={{
          name: team.name,
          vision: team.vision,
          mission: team.mission,
          priorities: team.priorities,
          website: team.website,
          profilePic: team.profilePic,
        }}
        showCurrent={false}
        showNew={false}
        onSubmit={async (data) => {
          await req('patch /admin/teams/{teamId}', { teamId: team.id }, data);
          internalOnClose();
        }}
      />
    );
  } else if (editorType === 'members') {
    contents = (
      <div>
        <SectionTitle>Edit team members</SectionTitle>
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchBox<SearchResponse['results'][number]>
              getItems={async (query) => {
                const res = await req('post /admin/search', { query, types: ['person'] });
                return res.data.results.filter((r) => !persons.map((p) => p.id).includes(r.id));
              }}
              onSelect={async (personResult) => {
                await req('post /admin/relations', { type: 'MEMBER_OF', childId: personResult.id, parentId: team.id });
                refetch();
              }}
              formatOptionLabel={renderSearchResult}
              placeholder="Add an existing person..."
            />
          </div>
          <Button onClick={() => alert('TODO')}><PlusSmIcon className="h-5 mb-0.5 mr-0.5" />New person</Button>
        </div>
        <div className="flex flex-col gap-2 my-4">
          {persons.map((p) => <TeamMemberEditorCard person={p} team={team} relations={relations} refetch={refetch} />)}
        </div>
      </div>
    );
  } else if (editorType === 'children') {
    const existingSubTeams = relations
      .filter((r) => r.type === 'PART_OF' && r.parentId === team.id)
      .map((r) => {
        const subTeam = teams.find((t) => t.id === r.childId);
        if (!subTeam) {
          throw new Error(`Failed to find subteam ${r.childId} for relation ${r.id}`);
        }
        return [r, subTeam] as const;
      });
    contents = (
      <div>
        <SectionTitle>Edit subteams</SectionTitle>
        <div className="flex gap-2">
          <div className="flex-1">
            <SearchBox<SearchResponse['results'][number]>
              getItems={async (query) => {
                const res = await req('post /admin/search', { query, types: ['team'] });
                return res.data.results.filter((r) => !existingSubTeams.map(([,t]) => t.id).includes(r.id));
              }}
              onSelect={async (teamResult) => {
                await req('post /admin/relations', { type: 'PART_OF', childId: teamResult.id, parentId: team.id });
                refetch();
              }}
              formatOptionLabel={renderSearchResult}
              placeholder="Add an existing team..."
            />
          </div>
          <Button onClick={() => alert('TODO')}><PlusSmIcon className="h-5 mb-0.5 mr-0.5" />New team</Button>
        </div>
        <div className="flex flex-col gap-2 my-4">
          {existingSubTeams.map(([relation, subTeam]) => <TeamTeamEditorCard subTeam={subTeam} relation={relation} refetch={refetch} />)}
        </div>
      </div>
    );
  } else if (editorType === 'parents') {
    // TODO
    contents = (
      <p>Parents</p>
    );
  } else if (editorType === 'slugs') {
    // TODO
    contents = (
      <p>Slugs</p>
    );
  } else {
    contents = (
      <>
        <SectionTitle>What do you want to edit?</SectionTitle>
        <div className="flex flex-col gap-4">
          <ChevronListButton onClick={() => setEditorType('details')}>
            <h3 className="font-bold">Details</h3>
            <p>Change the name, vision, mission, priorities, etc.</p>
          </ChevronListButton>
          <ChevronListButton onClick={() => setEditorType('members')}>
            <h3 className="font-bold">Members</h3>
            <p>Change team members and managers</p>
          </ChevronListButton>
          <ChevronListButton onClick={() => setEditorType('children')}>
            <h3 className="font-bold">Subteams</h3>
            <p>Add or remove subteams</p>
          </ChevronListButton>
          {/* <ChevronListButton onClick={() => setEditorType('parents')}>
            <h3 className="font-bold">Parent teams</h3>
            <p>Change which teams this is part of</p>
          </ChevronListButton> */}
          {/* <ChevronListButton onClick={() => setEditorType('slugs')}>
            <h3 className="font-bold">Slugs</h3>
            <p>Manage short URLs for this team</p>
          </ChevronListButton> */}
        </div>
      </>
    );
  }

  return (
    <Modal open={open} onClose={internalOnClose}>
      {contents}
    </Modal>
  );
};

const ChevronListButton: React.FC<React.PropsWithChildren<{ onClick: () => void }>> = ({ onClick, children }) => {
  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <Link onClick={onClick} className="p-4 bg-gray-100 hover:bg-gray-200 transition-all flex items-center">
      <div className="flex-1">
        {children}
      </div>
      <ChevronRightIcon className="h-5" />
    </Link>
  );
};

const renderSearchResult = (item: SearchResponse['results'][number]): React.ReactNode => {
  return (
    <div>
      <div>{item.title}</div>
      {item.subtitle && <div className="text-xs">{item.subtitle.map((fragment) => <span className={fragment.highlight ? 'bg-yellow-400' : ''}>{fragment.text}</span>)}</div>}
    </div>
  );
};

const TeamMemberEditorCard: React.FC<{ person: Person, team: Team, relations: Relation[], refetch: () => Promise<unknown> }> = ({
  person, team, relations, refetch
}) => {
  const initialMemberRelation = relations.find((r) => r.type === 'MEMBER_OF' && r.childId === person.id && r.parentId === team.id);
  if (!initialMemberRelation) {
    throw new Error(`TeamMemberEditorCard missing initial team relation for person ${person.id} on team ${team.id}`);
  }
  const initialManagerRelation = relations.find((r) => r.type === 'MANAGER_OF' && r.childId === person.id && r.parentId === team.id);

  const req = useRawReq();

  const { register, handleSubmit, formState: { isSubmitting } } = useForm<{
    teamTitle: string,
    isManager: boolean,
  }>({
    defaultValues: {
      teamTitle: initialMemberRelation.title ?? '',
      isManager: !!initialManagerRelation,
    }
  });
  const onSubmit = handleSubmit(async (data) => {
    if (initialManagerRelation && !data.isManager) {
      await req('delete /admin/relations/{relationId}', { relationId: initialManagerRelation.id });
    }
    if (!initialManagerRelation && data.isManager) {
      await req('post /admin/relations', { childId: person.id, parentId: team.id, type: 'MANAGER_OF' });
    }
    if (initialMemberRelation.title !== data.teamTitle || null) {
      await req('patch /admin/relations/{relationId}', { relationId: initialMemberRelation.id }, { title: data.teamTitle || null });
    }
  });

  const onRemove = async () => {
    if (initialManagerRelation) {
      await req('delete /admin/relations/{relationId}', { relationId: initialManagerRelation.id });
    }
    await req('delete /admin/relations/{relationId}', { relationId: initialMemberRelation.id });
    await refetch();
  };

  return (
    <form className="shadow border bg-white text-black text-left flex flex-row" onSubmit={onSubmit}>
      {/* TODO: nicer missing profile pic image */}
      <img src={person.profilePic ?? 'https://upload.wikimedia.org/wikipedia/commons/4/48/No_image_%28male%29.svg'} alt="" className="aspect-square object-cover h-28" />
      <div className="py-2 px-3 min-w-0 flex-1">
        <div className="text-xl">{person.name}</div>
        <div className="grid grid-cols-2 flex-1 mb-2">
          <div>
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label>Team title (optional): <input className="bg-gray-200 px-1.5 py-1 w-60" type="text" placeholder={person.jobTitle} {...register('teamTitle')} /></label>
          </div>
          <div className="mt-1">
            {/* eslint-disable-next-line jsx-a11y/label-has-associated-control */}
            <label>Manages this team: <input type="checkbox" {...register('isManager')} /></label>
          </div>
        </div>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <Link onClick={onRemove} className="text-red-700 hover:text-red-900 transition-all">
          <TrashIcon className="h-5 mb-1" /> Remove
        </Link>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <Link onClick={onSubmit} className="text-blue-500 hover:text-blue-900 transition-all ml-4">
          <CheckIcon className="h-5 mb-1" /> {isSubmitting ? 'Saving...' : 'Save'}
        </Link>
      </div>
    </form>
  );
};

const TeamTeamEditorCard: React.FC<{ subTeam: Team, relation: Relation, refetch: () => Promise<unknown> }> = ({
  subTeam, relation, refetch
}) => {
  const req = useRawReq();

  const onRemove = async () => {
    await req('delete /admin/relations/{relationId}', { relationId: relation.id });
    await refetch();
  };

  return (
    <div className="shadow border bg-white text-black text-left flex flex-row">
      {/* TODO: nicer missing profile pic image */}
      <img src={subTeam.profilePic ?? 'https://upload.wikimedia.org/wikipedia/commons/4/48/No_image_%28male%29.svg'} alt="" className="aspect-square object-cover h-28" />
      <div className="py-2 px-3 min-w-0 flex-1">
        <div className="text-xl">{subTeam.name}</div>
        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
        <Link onClick={onRemove} className="text-red-700 hover:text-red-900 transition-all">
          <TrashIcon className="h-5 mb-1" /> Remove
        </Link>
      </div>
    </div>
  );
};

export default TeamPage;
