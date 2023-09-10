import { ulid } from 'ulid';
import { fixedGroups } from '@odir/shared';
import { middyfy } from '../../../helpers/wrapper';
import { assertHasGroup, insert } from '../../../helpers/db';
import { domainTable } from '../../../helpers/tables';
import { $DomainCreation, $Ulid } from '../../../schemas';

export const main = middyfy($DomainCreation, $Ulid, true, async (event) => {
  assertHasGroup(event, fixedGroups.Admin);

  const domain = await insert(domainTable, {
    id: ulid(),
    ...event.body,
  });

  return domain.id;
});
