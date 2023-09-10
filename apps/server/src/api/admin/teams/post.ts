import { ulid } from 'ulid';
import { middyfy } from '../../../helpers/wrapper';
import { inTransaction, insertT } from '../../../helpers/db';
import { slugTable, teamTable } from '../../../helpers/tables';
import { $TeamCreation, $Ulid } from '../../../schemas';
import { getSlug } from '../../../helpers/getSlug';

export const main = middyfy($TeamCreation, $Ulid, true, async (event) => {
  const { id, slug } = await getSlug(event.body.preferredSlug ?? event.body.name);

  await inTransaction([
    insertT(teamTable, {
      id,
      ...event.body,
      preferredSlug: slug,
      lastEditedAt: Math.floor(Date.now() / 1000),
      createdAt: Math.floor(Date.now() / 1000),
      lastEditedBy: event.auth.payload.subject,
    }),
    insertT(slugTable, {
      id: ulid(),
      type: 'team',
      underlyingId: id,
      value: id,
    }),
    insertT(slugTable, {
      id: ulid(),
      type: 'team',
      underlyingId: id,
      value: slug,
    }),
  ]);

  return id;
});
