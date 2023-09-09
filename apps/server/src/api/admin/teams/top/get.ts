import { get } from '../../../../helpers/db';
import { teamTable } from '../../../../helpers/tables';
import { middyfy } from '../../../../helpers/wrapper';
import { $Teams } from '../../../../schemas';

export const main = middyfy(null, $Teams, true, async () => {
  // TODO: move to config or database table?
  return Promise.all(
    ['01H8W4Z5YAH852PBM18N467F9F', '01H8W4Z5YBVNWKV5R3C8Q9K3F5']
      .map((teamId) => get(teamTable, { id: teamId }))
  );
});
