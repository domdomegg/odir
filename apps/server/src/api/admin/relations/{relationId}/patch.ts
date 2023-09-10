import { middyfy } from '../../../../helpers/wrapper';
import { update } from '../../../../helpers/db';
import { relationTable } from '../../../../helpers/tables';
import { $RelationEdits } from '../../../../schemas';

export const main = middyfy($RelationEdits, null, true, async (event) => {
  await update(relationTable, { id: event.pathParameters.relationId }, event.body);
});
