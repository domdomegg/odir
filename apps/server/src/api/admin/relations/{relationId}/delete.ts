import { fixedGroups } from '@odir/shared';
import { middyfy } from '../../../../helpers/wrapper';
import { assertHasGroup, remove } from '../../../../helpers/db';
import { relationTable } from '../../../../helpers/tables';

export const main = middyfy(null, null, true, async (event) => {
  assertHasGroup(event, fixedGroups.Admin);
  await remove(relationTable, { id: event.pathParameters.relationId });
});
