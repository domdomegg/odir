import { fixedGroups } from '@odir/shared';
import { assertHasGroup, scan } from '../../../helpers/db';
import { personTable } from '../../../helpers/tables';
import { middyfy } from '../../../helpers/wrapper';
import { $Persons } from '../../../schemas';

export const main = middyfy(null, $Persons, true, async (event) => {
  assertHasGroup(event, fixedGroups.Admin);
  return scan(personTable);
});
