import { fixedGroups } from '@odir/shared';
import { middyfy } from '../../../../helpers/wrapper';
import { assertHasGroup, update } from '../../../../helpers/db';
import { teamTable } from '../../../../helpers/tables';
import { $TeamEdits } from '../../../../schemas';

export const main = middyfy($TeamEdits, null, true, async (event) => {
  assertHasGroup(event, fixedGroups.Admin);
  await update(teamTable, { id: event.pathParameters.teamId }, event.body);
});
