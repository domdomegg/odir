import { middyfy } from '../../../../helpers/wrapper';
import { update } from '../../../../helpers/db';
import { personTable } from '../../../../helpers/tables';
import { $PersonEdits } from '../../../../schemas';

export const main = middyfy($PersonEdits, null, true, async (event) => {
  await update(personTable, { id: event.pathParameters.personId }, event.body);
});
