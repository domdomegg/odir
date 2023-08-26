import { db } from '../../../database';
import { PersonUpdate, Person } from '../../../database_types';

export async function updatePerson(id: string, updateWith: PersonUpdate) {
  await db.updateTable('person').set(updateWith).where('id', '=', id).execute();
}

export async function deletePerson(id: string) {
  return db.deleteFrom('person').where('id', '=', id)
    .returningAll()
    .executeTakeFirst();
}
