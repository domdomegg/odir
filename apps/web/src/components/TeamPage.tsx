import { ChevronRightIcon, PencilIcon } from '@heroicons/react/outline';
import React, { useState } from 'react';
import Section, { SectionTitle } from './Section';
import {
  EntityResponse, Person, Relation, Slug, Team
} from '../helpers/generated-api-client';
import Link from './Link';
import Button from './Button';
import Modal from './Modal';

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
            <Button variant="gray" onClick={() => setShowEditModal(true)}><PencilIcon className="h-5 mb-0.5 mr-0.5" /> Edit team</Button>
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
  const isTeamManager = relations.find((r) => r.type === 'MANAGER_OF' && r.childId === person.id && r.parentId === team.id);

  return (
    <Link href={`/admin/${person.preferredSlug}`}>
      <div className="shadow border text-black text-center flex flex-col hover:shadow-lg transition-all">
        {/* TODO: nicer missing profile pic image */}
        <img src={person.profilePic ?? 'https://upload.wikimedia.org/wikipedia/commons/4/48/No_image_%28male%29.svg'} alt="" className="aspect-square object-cover" />
        {isTeamManager && <div className="text-xs p-0.5 bg-purple-500 text-white font-bold">Manages this team</div>}
        <div className="p-2">
          <div className="text-xl">{person.name}</div>
          <div className="text-gray-600">{person.jobTitle}</div>
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
  open, onClose, team, relations, teams, persons, slugs, hasDetailedAccess, refetch
}) => {
  const [editorType, setEditorType] = useState<undefined | 'details' | 'members' | 'children' | 'parents'>();

  if (!open) {
    return null;
  }

  return (
    <Modal open={open} onClose={onClose}>
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
          <h3 className="font-bold">Children</h3>
          <p>Add or remove subteams</p>
        </ChevronListButton>
        <ChevronListButton onClick={() => setEditorType('parents')}>
          <h3 className="font-bold">Parents</h3>
          <p>Change which teams this is part of</p>
        </ChevronListButton>
      </div>
    </Modal>
  );
};

const ChevronListButton: React.FC<React.PropsWithChildren<{ onClick: () => void }>> = ({ onClick, children }) => {
  return (
    // eslint-disable-next-line jsx-a11y/anchor-is-valid
    <Link onClick={onClick} className="p-4 bg-gray-100 hover:bg-gray-200 transition-all rounded flex items-center">
      <div className="flex-1">
        {children}
      </div>
      <ChevronRightIcon className="h-5" />
    </Link>
  );
};

export default TeamPage;
