import { fixedGroups } from '@odir/shared';
import { assertHasGroup, scan } from '../../../helpers/db';
import { teamTable } from '../../../helpers/tables';
import { middyfy } from '../../../helpers/wrapper';
import { $Teams } from '../../../schemas';

export const main = middyfy(null, $Teams, true, async (event) => {
  assertHasGroup(event, fixedGroups.Admin);
  return scan(teamTable);
});
