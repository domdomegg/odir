import { sql } from 'kysely';
import { db } from '../../../database';
import { Person } from '../../../database_types';
import { middyfy } from '../../../helpers/wrapper';
import { $Status } from '../../../schemas';

export const main = middyfy(null, $Status, false, async () => {
  // await db.schema.createTable('person')
  //   .addColumn('id', 'text', (col) => col.primaryKey())
  //   .addColumn('name', 'text', (col) => col.notNull())
  //   .addColumn('email', 'text', (col) => col.notNull())
  //   .addColumn('jobTitle', 'text')
  //   .addColumn('grade', 'text')
  //   .addColumn('linkedin', 'text')
  //   .addColumn('motivation', 'text')
  //   .addColumn('policyBackground', 'text')
  //   .addColumn('howSupportOthers', 'text')
  //   .addColumn('howHelpMe', 'text')
  //   .addColumn('profilePic', 'text')
  //   .addColumn('lastEditedAt', 'timestamp', (cb) => cb.notNull().defaultTo(sql`now()`))
  //   .addColumn('lastEditedPerson', 'text', (col) => col.notNull())
  //   .addColumn('createdAt', 'timestamp', (cb) => cb.notNull().defaultTo(sql`now()`))
  //   .ifNotExists()
  //   .execute();

  await db.insertInto('person').values({
    id: '1', name: 'Malena', email: 'm@m.com', jobTitle: null, grade: null, linkedin: null, about: null, motivation: null, policyBackground: null, howSupportOthers: null, howHelpMe: null, profilePic: null, lastEditedAt: new Date(), createdAt: new Date(), lastEditedPerson: 'Malena'
  } as Person).execute();

  const person = await db.selectFrom('person')
    .where('id', '=', '1')
    .selectAll()
    .executeTakeFirst();

  return { message: person?.name ?? 'Unknown first name' };
});

// async function findPersonById(id: number): Promise<Person | undefined > {
//   const p: Person | undefined = await db.selectFrom('person')
//     .where('id', '=', id)
//     .selectAll()
//     .executeTakeFirst();
//   return p;
// }

// async function findPeople(criteria: Partial<Person>) {
//   let query = db.selectFrom('person');

//   if (criteria.id) {
//     query = query.where('id', '=', criteria.id); // Kysely is immutable, you must re-assign!
//   }

//   if (criteria.first_name) {
//     query = query.where('first_name', '=', criteria.first_name);
//   }

//   if (criteria.last_name !== undefined) {
//     query = query.where(
//       'last_name',
//       criteria.last_name === null ? 'is' : '=',
//       criteria.last_name
//     );
//   }
//   if (criteria.created_at) {
//     query = query.where('created_at', '=', criteria.created_at);
//   }

//   return Promise.resolve(await query.selectAll().execute());
// }
