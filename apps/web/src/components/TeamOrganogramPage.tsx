import { MinusIcon, PlusIcon } from '@heroicons/react/outline';
import React, { useState } from 'react';
import { Helmet } from 'react-helmet';
import Section from './Section';
import {
  EntityResponse, Person, Relation, Team
} from '../helpers/generated-api-client';
import Button from './Button';
import { TeamEditorModal, TeamEditorState } from './TeamEditorModal';
import { useReq } from '../helpers/networking';
import Alert from './Alert';

const TeamOrganogramPage: React.FC<{ data: EntityResponse & { type: 'team' }, refetch: () => Promise<unknown> }> = ({ data, refetch }) => {
  // const parentTeams = data.relations.filter((r) => r.type === 'PART_OF' && r.childId === data.team.id).map((r) => {
  //   const parentTeam = data.teams.find((t) => t.id === r.parentId);
  //   if (!parentTeam) throw new Error(`Team ${r.parentId} was parent of team ${r.childId} (relation ${r.id}) but not provided to TeamPage component.`);
  //   return parentTeam;
  // });

  return (
    <>
      <Helmet>
        <title>
          Directory Navigator: {data.team.name} - Organogram
        </title>
      </Helmet>
      <Section>
        {/* TODO: render parent teams: when clicked this should navigate to the parent team organogram page. this should be fine given most data will be cached: although want to somehow retain which subtree should be open */}
        <OrganogramCard data={data} refetch={refetch} lineStemType="none" />
      </Section>
    </>
  );
};

type LineStemType =
  | 'none' // should not draw any line stems above
  | 'start-end' // expect parent only
  | 'start-continues' // expect parent and boxes right
  | 'middle' // expects boxes left and right
  | 'end'; // expects boxes left only

const OrganogramCard: React.FC<{
  data: EntityResponse & { type: 'team' },
  refetch: () => Promise<unknown>,
  lineStemType: LineStemType
}> = ({
  data: {
    team, teams, persons, relations, slugs, hasDetailedAccess
  },
  lineStemType,
  refetch
}) => {
  // TODO: add button to open the editor
  const [editorState, setEditorState] = useState<TeamEditorState>('closed');
  const [expanded, setExpanded] = useState(false);

  const subTeams = relations.filter((r) => r.type === 'PART_OF' && r.parentId === team.id).map((r) => {
    const subTeam = teams.find((t) => t.id === r.childId);
    if (!subTeam) throw new Error(`Team ${r.childId} was child of team ${r.parentId} (relation ${r.id}) but not provided to TeamTeams component.`);
    return subTeam;
  });

  const personString = getPersonString(persons, relations);

  return (
    <div>
      <OrganogramCardLayout title={team.name} subtitle={personString} expanded={subTeams.length > 0 ? expanded : null} onExpand={() => setExpanded((s) => !s)} lineStemType={lineStemType} />
      {expanded && <div className="flex flex-row gap-4">{subTeams.map((t, index, arr) => <ConnectedOrganogramCard key={t.id} team={t} lineStemType={getLineStemType(index, arr)} />)}</div>}
      <TeamEditorModal editorState={editorState} setEditorState={setEditorState} team={team} relations={relations} teams={teams} persons={persons} slugs={slugs} hasDetailedAccess={hasDetailedAccess} refetch={refetch} />
    </div>
  );
};

const getLineStemType = (index: number, arr: unknown[]): LineStemType => {
  if (arr.length === 1) return 'start-end';
  if (index === 0) return 'start-continues';
  if (index === arr.length - 1) return 'end';
  return 'middle';
};

const ConnectedOrganogramCard: React.FC<{ team: Team, lineStemType: LineStemType }> = ({ team, lineStemType }) => {
  const [res, refetch] = useReq('get /admin/entity/{entitySlug}', { entitySlug: team.id });

  if (res.error) {
    return <Alert>{res.error}</Alert>;
  }

  if (res.loading) {
    return (
      <OrganogramCardLayout title={team.name} subtitle={null} expanded={null} lineStemType={lineStemType} />
    );
  }

  if (!res.data || res.data.type !== 'team') {
    return <Alert>Expected team data, but got type: {res.data?.type}</Alert>;
  }

  return <OrganogramCard data={res.data} refetch={refetch} lineStemType={lineStemType} />;
};

const OrganogramCardLayout: React.FC<{ title: string, subtitle: null | string, expanded: null | boolean, onExpand?: (() => void), lineStemType: LineStemType }> = ({
  title, subtitle, expanded, onExpand, lineStemType
}) => {
  return (
    <div>
      {lineStemType === 'start-end' && <div className="border-l-8 border-primary-600 h-10 ml-4" />}
      {lineStemType === 'start-continues' && <><div className="border-b-8 border-primary-600 -mt-2 ml-4 relative top-8" /><div className="border-l-8 border-primary-600 h-10 ml-4" /></>}
      {lineStemType === 'middle' && <><div className="border-b-8 border-primary-600 -mt-2 relative right-4 top-8 w-[calc(100%+1rem)]" /><div className="border-l-8 border-primary-600 h-2 mt-8 ml-6" /></>}
      {lineStemType === 'end' && <><div className="border-b-8 border-primary-600 -mt-2 relative right-4 top-8 w-12" /><div className="border-l-8 border-primary-600 h-2 mt-8 ml-6" /></>}
      <div className="shadow border bg-white text-black text-left inline-flex flex-col max-w-sm gap-1 p-2 hover:shadow-md transition-all">
        <div className="font-bold">{title}</div>
        {subtitle !== null ? <div>{subtitle}</div> : <div className="skeleton h-6" />}
        {expanded !== null && (
          <div className="text-center -mb-6">
            <Button className="border w-8 h-8 p-0 relative z-10" onClick={onExpand}>{expanded ? <MinusIcon className="w-full h-full mb-2" /> : <PlusIcon className="w-full h-full mb-2" />} </Button>
          </div>
        )}
      </div>
    </div>
  );
};

/** @returns e.g. 'Manager: Alice Smith. Members: Joe Bloggs, Jane Doe' */
const getPersonString = (persons: Person[], relations: Relation[]) => {
  const managers = new Set(relations.filter((r) => r.type === 'MANAGER_OF').map((r) => {
    const result = persons.find((p) => p.id === r.childId);
    if (!result) throw new Error(`Missing person in getPersonString for: child ${r.childId} and parent ${r.parentId}`);
    return result;
  }));

  const nonManagers = persons.filter((p) => !managers.has(p));

  const managerString = managers.size === 0 ? '' : `Manager${managers.size === 1 ? '' : 's'}: ${[...managers].map((m) => m.name).join(', ')}. `;
  const memberString = nonManagers.length === 0 ? '' : `Member${nonManagers.length === 1 ? '' : 's'}: ${[...nonManagers].map((m) => m.name).join(', ')}.`;

  return (managerString + memberString).trim();
};

export default TeamOrganogramPage;
