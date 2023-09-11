import env from '../../../../env/env';
import { get } from '../../../../helpers/db';
import { teamTable } from '../../../../helpers/tables';
import { middyfy } from '../../../../helpers/wrapper';
import { $Teams } from '../../../../schemas';

export const main = middyfy(null, $Teams, true, async () => {
  // TODO: move to config or database table?
  return Promise.all(
    env.TOP_TEAM_IDS.map((teamId) => get(teamTable, { id: teamId }))
  );
});
