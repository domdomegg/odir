import { fixedGroups } from '@odir/shared';
import { middyfy } from '../../../../helpers/wrapper';
import { assertHasGroup, update } from '../../../../helpers/db';
import { groupTable } from '../../../../helpers/tables';
import { $GroupEdits } from '../../../../schemas';

export const main = middyfy($GroupEdits, null, true, async (event) => {
  assertHasGroup(event, fixedGroups.Admin);
  await update(groupTable, { id: event.pathParameters.groupId }, event.body);
});
