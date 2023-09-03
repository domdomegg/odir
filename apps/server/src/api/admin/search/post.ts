import Fuse from 'fuse.js';
import { scan } from '../../../helpers/db';
import { personTable, teamTable } from '../../../helpers/tables';
import { middyfy } from '../../../helpers/wrapper';
import {
  $SearchRequest, $SearchResponse, Person, SearchResponse, Team
} from '../../../schemas';

type QueryItem = ((Person & { type: 'person' }) | (Team & { type: 'team' }));

const EXCLUDED_SEARCH_KEYS = ['id', 'profilePic', 'lastEditedBy', 'lastEditedAt', 'createdAt'];

export const main = middyfy($SearchRequest, $SearchResponse, true, async (event) => {
  const types = event.body.types ?? ['team', 'person'];

  const queryItems: QueryItem[] = [];
  if (types.includes('person')) {
    const persons = await scan(personTable);
    queryItems.push(...persons.map<QueryItem>((p) => ({ ...p, type: 'person' })));
  }
  if (types.includes('team')) {
    const teams = await scan(teamTable);
    queryItems.push(...teams.map<QueryItem>((p) => ({ ...p, type: 'team' })));
  }

  const searchKeys: Set<{ name: string, weight: number }> = new Set();
  queryItems.forEach((item) => Object.keys(item).filter((k) => !EXCLUDED_SEARCH_KEYS.includes(k)).map((key) => searchKeys.add({ name: key, weight: key === 'name' ? 2 : 1 })));

  const fuse = new Fuse(queryItems, { keys: [...searchKeys] });
  const filtered = fuse.search(event.body.query);

  // TODO: add highlighted subtitle based on includeMatches
  const results: SearchResponse['results'] = filtered.map((f) => ({
    id: f.item.id,
    slug: f.item.preferredSlug,
    title: f.item.name,
    type: f.item.type,
  }));

  return { results };
});
