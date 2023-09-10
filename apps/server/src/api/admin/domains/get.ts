import { fixedGroups } from '@odir/shared';
import { assertHasGroup, scan } from '../../../helpers/db';
import { domainTable } from '../../../helpers/tables';
import { middyfy } from '../../../helpers/wrapper';
import { $Domains } from '../../../schemas';

export const main = middyfy(null, $Domains, true, async (event) => {
  assertHasGroup(event, fixedGroups.Admin);
  return scan(domainTable);
});
