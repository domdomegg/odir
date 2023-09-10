import { middyfy } from '../../../../helpers/wrapper';
import { update } from '../../../../helpers/db';
import { teamTable } from '../../../../helpers/tables';
import { $TeamEdits } from '../../../../schemas';

export const main = middyfy($TeamEdits, null, true, async (event) => {
  await update(teamTable, { id: event.pathParameters.teamId }, event.body);
});
