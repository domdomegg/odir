import type { APIGatewayProxyEventV2, APIGatewayProxyResult, Handler as AWSHandler } from 'aws-lambda';
import 'source-map-support/register';
import { Kysely, sql } from 'kysely';
import { db } from '../database';
import { importMap } from './_router-imports';

async function migrateDatabase(): Promise<void> {
  await db.schema.dropTable('person').execute();
  await db.schema.createTable('person')
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('name', 'text', (col) => col.notNull())
    .addColumn('email', 'text', (col) => col.notNull())
    .addColumn('jobTitle', 'text')
    .addColumn('grade', 'text')
    .addColumn('linkedin', 'text')
    .addColumn('about', 'text')
    .addColumn('motivation', 'text')
    .addColumn('policyBackground', 'text')
    .addColumn('howSupportOthers', 'text')
    .addColumn('howHelpMe', 'text')
    .addColumn('profilePic', 'text')
    .addColumn('lastEditedAt', 'timestamp', (cb) => cb.notNull().defaultTo(sql`now()`))
    .addColumn('lastEditedPerson', 'text', (col) => col.notNull())
    .addColumn('createdAt', 'timestamp', (cb) => cb.notNull().defaultTo(sql`now()`))
    .ifNotExists()
    .execute();
}

// This router allows us to run the server with a single AWS Lambda. Doing this means:
// - it is kept warm between time-proximate requests to different endpoints, e.g. when navigating around admin pages
// - we can set up provisioned capacity for all endpoints at the minimum level of 1 without it being too costly
// Both of these reduce cold starts, making our back-end more responsive
// This does come with the downside that we lose a little granularity for some AWS Lambda metrics
export const main: AWSHandler<APIGatewayProxyEventV2, APIGatewayProxyResult> = async (event, context) => {
  await migrateDatabase();
  const [method, route] = event.routeKey.split(' ');
  const importKey = `${route}/${method.toLowerCase()}`;
  if (!(importKey in importMap)) {
    return {
      statusCode: 404,
      body: JSON.stringify({ message: 'Endpoint not found' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }
  const module = await importMap[importKey as keyof typeof importMap]();
  return module.main(
    event,
    context,
    () => { throw new Error("Don't use AWS callbacks"); },
  ) as Promise<APIGatewayProxyResult>;
};
