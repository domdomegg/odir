import { ulid } from 'ulid';
import { fixedGroups } from '@odir/shared';
import { middyfy } from '../../../helpers/wrapper';
import { assertHasGroup, insert } from '../../../helpers/db';
import { relationTable } from '../../../helpers/tables';
import { $RelationCreation, $Ulid } from '../../../schemas';

export const main = middyfy($RelationCreation, $Ulid, true, async (event) => {
  assertHasGroup(event, fixedGroups.Admin);

  const relation = await insert(relationTable, {
    id: ulid(),
    ...event.body,
  });

  return relation.id;
});
