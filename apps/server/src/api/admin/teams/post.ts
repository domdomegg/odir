import { ulid } from 'ulid';
import { fixedGroups } from '@odir/shared';
import { middyfy } from '../../../helpers/wrapper';
import { assertHasGroup, insert } from '../../../helpers/db';
import { teamTable } from '../../../helpers/tables';
import { $TeamCreation, $Ulid } from '../../../schemas';

export const main = middyfy($TeamCreation, $Ulid, true, async (event) => {
  assertHasGroup(event, fixedGroups.Admin);

  const team = await insert(teamTable, {
    id: ulid(),
    ...event.body,
    lastEditedAt: Math.floor(Date.now() / 1000),
    createdAt: Math.floor(Date.now() / 1000),
    lastEditedBy: event.auth.payload.subject,
  });

  return team.id;
});
