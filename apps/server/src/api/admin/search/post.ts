import { middyfy } from '../../../helpers/wrapper';
import { $SearchRequest, $SearchResponse, SearchResponse } from '../../../schemas';

export const main = middyfy($SearchRequest, $SearchResponse, true, async () => {
  // TODO: actually search records. This is placeholder data
  const mockResults: SearchResponse = {
    results: [{
      id: 'usr_1',
      type: 'person',
      slug: 'usr_2',
      title: 'Adam Jones',
      subtitle: [{ text: '...enjoys getting around by ', highlight: false }, { text: 'bike', highlight: true }, { text: ', and will encourage you to...', highlight: false }],
    }, {
      id: 'usr_2',
      type: 'person',
      slug: 'usr_2',
      title: 'Malena Schmidt',
      subtitle: [{ text: 'I have a ', highlight: false }, { text: 'bike', highlight: true }, { text: ' and sometimes cycle to...', highlight: false }],
    }, {
      id: 'team_1',
      type: 'team',
      slug: 'team_1',
      title: 'Company Bike Club',
    }]
  };

  return mockResults;
});
