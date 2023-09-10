import { ulid } from 'ulid';
import { middyfy } from '../../../helpers/wrapper';
import { insert } from '../../../helpers/db';
import { relationTable } from '../../../helpers/tables';
import { $RelationCreation, $Ulid } from '../../../schemas';

export const main = middyfy($RelationCreation, $Ulid, true, async (event) => {
  const relation = await insert(relationTable, {
    id: ulid(),
    ...event.body,
  });

  return relation.id;
});
