import { db } from '../../../database';
import { NewPerson } from '../../../database_types';

export async function createPerson(person: NewPerson) {
  return Promise.resolve(await db.insertInto('person')
    .values(person)
    .returningAll()
    .executeTakeFirstOrThrow());
}
