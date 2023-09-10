import { middyfy } from '../../../../helpers/wrapper';
import { remove } from '../../../../helpers/db';
import { relationTable } from '../../../../helpers/tables';

export const main = middyfy(null, null, true, async (event) => {
  await remove(relationTable, { id: event.pathParameters.relationId });
});
