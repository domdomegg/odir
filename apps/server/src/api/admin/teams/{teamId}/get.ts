import { get } from '../../../../helpers/db';
import { teamTable } from '../../../../helpers/tables';
import { middyfy } from '../../../../helpers/wrapper';
import { $Team } from '../../../../schemas';

export const main = middyfy(null, $Team, true, async (event) => {
  return get(teamTable, { id: event.pathParameters.userId });
});
