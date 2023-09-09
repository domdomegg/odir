import { CheckIcon, PencilIcon, TrashIcon } from '@heroicons/react/outline';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useHotkeys } from 'react-hotkeys-hook';
import Section, { SectionTitle } from './Section';
import {
  EntityResponse, Person, Relation, Slug, Team, TeamEdits
} from '../helpers/generated-api-client';
import Link from './Link';
import Button from './Button';
import Modal from './Modal';
import { Form } from './Form';
import { useRawReq } from '../helpers/networking';
import { EntitySearchBox } from './SearchBox';
import { Breadcrumbs } from './Breadcrumbs';
import { TeamCardGrid } from './TeamCard';
import { ChevronList, ChevronListButton } from './ChevronList';
import { PersonCardGrid } from './PersonCard';

type EditorState = 'closed' | 'menu' | 'details' | 'members' | 'children' | 'parents' | 'slugs';

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

  const [editorState, setEditorState] = useState<EditorState>('closed');
  useHotkeys('e', () => {
    if (editorState === 'closed') {
      setEditorState('menu');
    }
  });
  useHotkeys('d', (event) => {
    if (editorState === 'closed' || editorState === 'menu') {
      setEditorState('details');
      event.preventDefault();
    }
  });
  useHotkeys(['m', 'p'], (event) => {
    if (editorState === 'closed' || editorState === 'menu') {
      setEditorState('members');
      event.preventDefault();
    }
  });
  useHotkeys(['s', 't'], (event) => {
    if (editorState === 'closed' || editorState === 'menu') {
      setEditorState('children');
      event.preventDefault();
    }
  });

  return (
    <Section>
      <div className="flex">
        <div className="flex-1">
          <Breadcrumbs parentChain={breadcrumbs} directParents={parentTeams} />
          <SectionTitle className="mt-2">{team.name}</SectionTitle>
        </div>
        <div>
          <div>
            <Button onClick={() => setEditorState('menu')}><PencilIcon className="h-5 mb-0.5 mr-0.5" /> Edit team</Button>
          </div>
        </div>
      </div>
      <TeamPersons persons={persons} relations={relations} team={team} />
      <h2 className="font-odir-header text-3xl font-bold mt-6 mb-1">Teams</h2>
      <TeamTeams teams={teams} relations={relations} team={team} />
      <h2 className="font-odir-header text-3xl font-bold mt-6 mb-1">About</h2>
      <TeamAbout team={team} />
      <TeamEditorModal editorState={editorState} setEditorState={setEditorState} team={team} relations={relations} teams={teams} persons={persons} slugs={slugs} hasDetailedAccess={hasDetailedAccess} refetch={refetch} />
    </Section>
  );
};

const TeamPersons: React.FC<{ persons: Person[], relations: Relation[], team: Team }> = ({ persons, relations, team }) => {
  if (!persons.length) {
    // TODO: link to add one
    return <div className="-mt-2">There are no people on this team.</div>;
  }

  return <PersonCardGrid persons={persons} relations={relations} team={team} />;
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

  return <TeamCardGrid teams={subTeams} />;
};

const TeamAbout: React.FC<{ team: Team }> = ({
  team
}) => {
  return (
    <div className="flex flex-col gap-4">
      {!team.vision && !team.mission && !team.priorities && !team.notes && !team.website && <p>There's no additional information on this team yet.</p>}
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

const TeamEditorModal: React.FC<{ editorState: EditorState, setEditorState: (editorState: EditorState) => void, team: Team, relations: Relation[], teams: Team[], persons: Person[], slugs: Slug[], hasDetailedAccess: boolean, refetch: () => Promise<unknown> }> = ({
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  editorState, setEditorState, team, relations, teams, persons, slugs, hasDetailedAccess, refetch
}) => {
  const req = useRawReq();
  const internalOnClose = async () => {
    setEditorState('closed');
    await refetch();
  };

  if (editorState === 'closed') {
    return null;
  }

  let contents: JSX.Element;
  if (editorState === 'details') {
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
  } else if (editorState === 'members') {
    contents = (
      <div>
        <SectionTitle>Edit team members</SectionTitle>
        <EntitySearchBox
          types={['person']}
          excludedIds={new Set(persons.map((p) => p.id))}
          idContext={{ teamId: team.id }}
          onSelectExisting={async (result) => {
            await req('post /admin/relations', { type: 'MEMBER_OF', childId: result.id, parentId: team.id });
            refetch();
          }}
          onAfterCreate={() => refetch()}
          placeholder="Add a team member..."
          autoFocus
          createable
        />
        <div className="flex flex-col gap-2 my-4">
          {persons.length === 0 && 'This team currently has no members'}
          {persons.map((p) => <TeamMemberEditorCard key={p.id} person={p} team={team} relations={relations} refetch={refetch} />)}
        </div>
      </div>
    );
  } else if (editorState === 'children') {
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
        <EntitySearchBox
          types={['team']}
          excludedIds={new Set(existingSubTeams.map(([,t]) => t.id))}
          idContext={{ teamId: team.id }}
          onSelectExisting={async (result) => {
            await req('post /admin/relations', { type: 'PART_OF', childId: result.id, parentId: team.id });
            refetch();
          }}
          onAfterCreate={() => refetch()}
          placeholder="Add a team..."
          autoFocus
          createable
        />
        <div className="flex flex-col gap-2 my-4">
          {existingSubTeams.length === 0 && 'This team currently has no subteams'}
          {existingSubTeams.map(([relation, subTeam]) => <TeamTeamEditorCard key={subTeam.id} subTeam={subTeam} relation={relation} refetch={refetch} />)}
        </div>
      </div>
    );
  } else if (editorState === 'parents') {
    // TODO
    contents = (
      <p>Parents</p>
    );
  } else if (editorState === 'slugs') {
    // TODO
    contents = (
      <p>Slugs</p>
    );
  } else {
    contents = (
      <>
        <SectionTitle>What do you want to edit?</SectionTitle>
        <ChevronList>
          <ChevronListButton title="Details" onClick={() => setEditorState('details')} variant="secondary">
            Change the name, vision, mission, priorities, etc.
          </ChevronListButton>
          <ChevronListButton title="Members" onClick={() => setEditorState('members')} variant="secondary">
            Change team members and managers
          </ChevronListButton>
          <ChevronListButton title="Subteams" onClick={() => setEditorState('children')} variant="secondary">
            Add or remove subteams
          </ChevronListButton>
          {/* <ChevronListButton onClick={() => setEditorState('parents')}>
            <h3 className="font-bold">Parent teams</h3>
            <p>Change which teams this is part of</p>
          </ChevronListButton> */}
          {/* <ChevronListButton onClick={() => setEditorState('slugs')}>
            <h3 className="font-bold">Slugs</h3>
            <p>Manage short URLs for this team</p>
          </ChevronListButton> */}
        </ChevronList>
      </>
    );
  }

  return (
    <Modal open onClose={internalOnClose}>
      {contents}
    </Modal>
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
            <label>Team title (optional): <input className="bg-gray-200 px-1.5 py-1 w-60" type="text" placeholder={person.jobTitle ?? ''} {...register('teamTitle')} /></label>
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
