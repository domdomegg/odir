import { fixedGroups } from '@odir/shared';
import { middyfy } from '../../../../helpers/wrapper';
import { assertHasGroup, update } from '../../../../helpers/db';
import { personTable } from '../../../../helpers/tables';
import { $PersonEdits } from '../../../../schemas';

export const main = middyfy($PersonEdits, null, true, async (event) => {
  assertHasGroup(event, fixedGroups.Admin);
  await update(personTable, { id: event.pathParameters.personId }, event.body);
});
