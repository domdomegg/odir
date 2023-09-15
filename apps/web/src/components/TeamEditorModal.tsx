import React from 'react';
import { CheckIcon, TrashIcon } from '@heroicons/react/outline';
import { withAssetPrefix } from 'gatsby';
import { useForm } from 'react-hook-form';
import { useRawReq } from '../helpers/networking';
import {
  Person, Relation, Slug, Team, TeamEdits
} from '../helpers/generated-api-client';
import { Form } from './Form';
import { SectionTitle } from './Section';
import { EntitySearchBox } from './SearchBox';
import { ProfileImageEditor } from './ProfileImageEditor';
import { ChevronList, ChevronListButton } from './ChevronList';
import { RequestFormLink } from './RequestFormLink';
import Modal from './Modal';
import Link from './Link';

export type TeamEditorState = 'closed' | 'menu' | 'details' | 'image' | 'members' | 'children' | 'parents' | 'slugs';

export const TeamEditorModal: React.FC<{ editorState: TeamEditorState, setEditorState: (editorState: TeamEditorState) => void, team: Team, relations: Relation[], teams: Team[], persons: Person[], slugs: Slug[], hasDetailedAccess: boolean, refetch: () => Promise<unknown> }> = ({
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
          about: { label: 'About (supports markdown)', inputType: 'textarea' },
          website: { label: 'Website', inputType: 'text' },
        }}
        initialValues={{
          name: team.name,
          about: team.about,
          website: team.website,
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
  } else if (editorState === 'image') {
    contents = (
      <ProfileImageEditor onComplete={async (profileImageUri) => {
        await req('patch /admin/teams/{teamId}', { teamId: team.id }, { profilePic: profileImageUri });
        internalOnClose();
      }}
      />
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
          <ChevronListButton title="Image" onClick={() => setEditorState('image')} variant="secondary">
            Upload a new profile image for this team.
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
        <div className="mt-4">
          <RequestFormLink message={`I wanted to edit the following page:\n\n${window.location.href}\n\nThe edits I wanted to make were:\n\n`} className="hover:underline">Something else</RequestFormLink>
        </div>
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
      <img src={person.profilePic ?? withAssetPrefix('/shared/images/missing-person-avatar.svg')} alt="" className="aspect-square object-cover h-28" />
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
      <img src={subTeam.profilePic ?? withAssetPrefix('/shared/images/missing-team-avatar.svg')} alt="" className="aspect-square object-cover h-28" />
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
