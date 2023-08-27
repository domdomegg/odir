import { scan } from '../../../helpers/db';
import { teamTable } from '../../../helpers/tables';
import { middyfy } from '../../../helpers/wrapper';
import { $Teams } from '../../../schemas';

export const main = middyfy(null, $Teams, true, async () => {
  return scan(teamTable);
});
