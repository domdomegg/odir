import createHttpError from 'http-errors';
import { get, scan } from '../../../../helpers/db';
import {
  personTable, relationTable, slugTable, teamTable
} from '../../../../helpers/tables';
import { middyfy } from '../../../../helpers/wrapper';
import {
  $EntityResponse, EntityResponse, Relation, Slug, Team
} from '../../../../schemas';

export const main = middyfy(null, $EntityResponse, true, async (event) => {
  const allSlugs = await scan(slugTable);
  const slug = allSlugs.find((s) => s.value === event.pathParameters.entitySlug);

  if (!slug) {
    throw new createHttpError.NotFound(`Entity for slug '${event.pathParameters.entitySlug}' not found`);
  }

  if (slug.type === 'team') {
    return findTeam(slug);
  }

  if (slug.type === 'person') {
    return findPerson(slug);
  }

  throw new Error(`Unknown slug type: ${slug.type}`);
});

// TODO: the functions in this file are horrifically database inefficient. But for now as a prototype this is fine.
// Plan is to switch to Postgres in future which should allow for making these kinds of queries way easier and faster.

const findTeam = async (slug: Slug): Promise<EntityResponse & { type: 'team' }> => {
  const team = await get(teamTable, { id: slug.underlyingId });
  const allRelations = await scan(relationTable);
  const relations = allRelations.filter((r) => r.childId === team.id || r.parentId === team.id);
  const breadcrumbs = await getBreadcrumbs(team.id, allRelations);
  const teamsToGet = new Set(relations.filter((r) => ['PART_OF'].includes(r.type)).map((r) => (r.childId === team.id ? r.parentId : r.childId)));
  const teams = await Promise.all([...teamsToGet].map((id) => get(teamTable, { id })));
  const personsToGet = new Set(relations.filter((r) => ['MEMBER_OF', 'LINE_MANAGED_BY', 'MANAGER_OF'].includes(r.type)).map((r) => (r.childId === team.id ? r.parentId : r.childId)));
  const persons = await Promise.all([...personsToGet].map((id) => get(personTable, { id })));
  const slugs = (await scan(slugTable)).filter((s) => s.underlyingId === team.id);
  const hasDetailedAccess = true; // TODO: use groups, and filter out team info

  return {
    type: 'team',
    team,
    breadcrumbs,
    relations,
    teams,
    persons,
    slugs,
    hasDetailedAccess,
  };
};

// TODO: stop at loops or max depth
const getBreadcrumbs = async (teamId: string, relations: Relation[]): Promise<Team[]> => {
  const parentRelation = relations.find((r) => r.childId === teamId); // todo: use title to filter to primary parent
  if (!parentRelation) {
    return [];
  }

  const parentTeam = await get(teamTable, { id: parentRelation.parentId });

  return [...await getBreadcrumbs(parentTeam.id, relations), parentTeam];
};

const findPerson = async (slug: Slug): Promise<EntityResponse & { type: 'person' }> => {
  const person = await get(personTable, { id: slug.underlyingId });
  const relations = (await scan(relationTable)).filter((r) => r.childId === person.id || r.parentId === person.id);
  const teamsToGet = new Set(relations.filter((r) => ['MEMBER_OF', 'MANAGER_OF'].includes(r.type)).map((r) => (r.childId === person.id ? r.parentId : r.childId)));
  const teams = await Promise.all([...teamsToGet].map((id) => get(teamTable, { id })));
  const personsToGet = new Set(relations.filter((r) => ['LINE_MANAGED_BY'].includes(r.type)).map((r) => (r.childId === person.id ? r.parentId : r.childId)));
  const persons = await Promise.all([...personsToGet].map((id) => get(personTable, { id })));
  const slugs = (await scan(slugTable)).filter((s) => s.underlyingId === person.id);
  const hasDetailedAccess = true; // TODO: use groups, and filter out person info

  return {
    type: 'person',
    person,
    relations,
    teams,
    persons,
    slugs,
    hasDetailedAccess,
  };
};
