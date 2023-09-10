import { fixedGroups } from '@odir/shared';
import { middyfy } from '../../../../helpers/wrapper';
import { assertHasGroup, update } from '../../../../helpers/db';
import { domainTable } from '../../../../helpers/tables';
import { $DomainEdits } from '../../../../schemas';

export const main = middyfy($DomainEdits, null, true, async (event) => {
  assertHasGroup(event, fixedGroups.Admin);
  await update(domainTable, { id: event.pathParameters.domainId }, event.body);
});
