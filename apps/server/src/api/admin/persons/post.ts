import { ulid } from 'ulid';
import { middyfy } from '../../../helpers/wrapper';
import { inTransaction, insertT } from '../../../helpers/db';
import { personTable, slugTable } from '../../../helpers/tables';
import { $PersonCreation, $Ulid } from '../../../schemas';
import { getSlug } from '../../../helpers/getSlug';

export const main = middyfy($PersonCreation, $Ulid, true, async (event) => {
  const { id, slug } = await getSlug(event.body.preferredSlug ?? event.body.name);

  await inTransaction([
    insertT(personTable, {
      id,
      ...event.body,
      preferredSlug: slug,
      lastEditedAt: Math.floor(Date.now() / 1000),
      createdAt: Math.floor(Date.now() / 1000),
      lastEditedBy: event.auth.payload.subject,
    }),
    insertT(slugTable, {
      id: ulid(),
      type: 'person',
      underlyingId: id,
      value: id,
    }),
    insertT(slugTable, {
      id: ulid(),
      type: 'person',
      underlyingId: id,
      value: slug,
    }),
  ]);

  return id;
});
