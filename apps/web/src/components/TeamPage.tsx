import { CollectionIcon, PencilIcon } from '@heroicons/react/outline';
import React, { useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { useRouter } from 'next/router';
import ReactMarkdown from 'react-markdown';
import Head from 'next/head';
import Section, { SectionTitle } from './Section';
import {
  EntityResponse, Person, Relation, Team
} from '../helpers/generated-api-client';
import Button from './Button';
import { Breadcrumbs } from './Breadcrumbs';
import { TeamCardGrid } from './TeamCard';
import { PersonCardGrid } from './PersonCard';
import { ENTITY_ORGANOGRAM_SUFFIX, ENTITY_PREFIX } from '../helpers/entityPrefix';
import { TeamEditorModal, TeamEditorState } from './TeamEditorModal';

const TeamPage: React.FC<{ data: EntityResponse & { type: 'team' }, refetch: () => Promise<unknown> }> = ({
  data: {
    team, breadcrumbs, relations, teams, persons, slugs, hasDetailedAccess
  }, refetch
}) => {
  const router = useRouter();
  const parentTeams = relations.filter((r) => r.type === 'PART_OF' && r.childId === team.id).map((r) => {
    const parentTeam = teams.find((t) => t.id === r.parentId);
    if (!parentTeam) throw new Error(`Team ${r.parentId} was parent of team ${r.childId} (relation ${r.id}) but not provided to TeamPage component.`);
    return parentTeam;
  });

  const [editorState, setEditorState] = useState<TeamEditorState>('closed');
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
  useHotkeys('i', (event) => {
    if (editorState === 'closed' || editorState === 'menu') {
      setEditorState('image');
      event.preventDefault();
    }
  });

  return (
    <>
      <Head>
        <title>
          Directory Navigator: {team.name}
        </title>
      </Head>
      <Section>
        <div className="flex">
          <div className="flex-1">
            <Breadcrumbs parentChain={breadcrumbs} directParents={parentTeams} />
            <SectionTitle className="mt-2">{team.name}</SectionTitle>
          </div>
          <div>
            <div>
              <Button onClick={() => router.push(`${ENTITY_PREFIX}${team.preferredSlug}${ENTITY_ORGANOGRAM_SUFFIX}`)}><CollectionIcon className="h-5 mb-0.5 mr-0.5" /> View organogram</Button>
              <Button onClick={() => setEditorState('menu')}><PencilIcon className="h-5 mb-0.5 mr-0.5" /> Edit team</Button>
            </div>
          </div>
        </div>
        <TeamPersons persons={persons} relations={relations} team={team} />
        <h2 className="font-odir-header text-3xl font-bold mt-6 mb-1">Teams</h2>
        <TeamTeams teams={teams} relations={relations} team={team} />
        {team.about && (
        <>
          <h2 className="font-odir-header text-3xl font-bold mt-6 mb-1">About</h2>
          <TeamAbout team={team} />
        </>
        )}
        <TeamEditorModal editorState={editorState} setEditorState={setEditorState} team={team} relations={relations} teams={teams} persons={persons} slugs={slugs} hasDetailedAccess={hasDetailedAccess} refetch={refetch} />
      </Section>
    </>
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
}) => (
  <ReactMarkdown className="prose prose-h1:text-xl prose-h2:text-lg prose-h3:text-base text-black marker:text-stone-600 mt-2 max-w-none" allowedElements={['h1', 'h2', 'h3', 'p', 'a', 'ul', 'ol', 'li']}>{team.about ?? ''}</ReactMarkdown>
);

export default TeamPage;
