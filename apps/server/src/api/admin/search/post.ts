import { scan } from '../../../helpers/db';
import { personTable, teamTable } from '../../../helpers/tables';
import { middyfy } from '../../../helpers/wrapper';
import { $SearchRequest, $SearchResponse, SearchResponse } from '../../../schemas';

export const main = middyfy($SearchRequest, $SearchResponse, true, async (event) => {
  const types = event.body.types ?? ['team', 'person'];
  const query = event.body.query.toLowerCase();

  const results: SearchResponse['results'] = [];
  if (types.includes('person')) {
    const allPersons = await scan(personTable);
    const matchingPersons = allPersons.filter((p) => p.name.toLowerCase().includes(query));
    results.push(...matchingPersons.map<SearchResponse['results'][number]>((p) => ({
      id: p.id,
      type: 'person',
      slug: p.preferredSlug,
      title: p.name,
    })));
  }
  if (types.includes('team')) {
    const allTeams = await scan(teamTable);
    const matchingTeams = allTeams.filter((t) => t.name.toLowerCase().includes(query));
    results.push(...matchingTeams.map<SearchResponse['results'][number]>((t) => ({
      id: t.id,
      type: 'team',
      slug: t.preferredSlug,
      title: t.name,
    })));
  }

  return { results };
});
