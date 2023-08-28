import { fixedGroups } from '@odir/shared';
import { middyfy } from '../../../../helpers/wrapper';
import { assertHasGroup, update } from '../../../../helpers/db';
import { relationTable } from '../../../../helpers/tables';
import { $RelationEdits } from '../../../../schemas';

export const main = middyfy($RelationEdits, null, true, async (event) => {
  assertHasGroup(event, fixedGroups.Admin);
  await update(relationTable, { id: event.pathParameters.relationId }, event.body);
});
