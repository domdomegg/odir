import { Pool } from 'pg';
import { Kysely, PostgresDialect } from 'kysely';
import { Database } from './database_types'; // this is the Database interface we defined earlier

const pgDialect = new PostgresDialect({
  pool: new Pool({
    database: 'postgres',
    host: 'localhost',
    user: 'postgres',
    password: 'password',
    port: 5434,
    max: 10,
  })
});

// const sqliteDialect = new SqliteDialect({
//   database: new SQLite(':memory:')
// });

// Database interface is passed to Kysely's constructor, and from now on, Kysely
// knows your database structure.
// Dialect is passed to Kysely's constructor, and from now on, Kysely knows how
// to communicate with your database.
export const db = new Kysely<Database>({
  dialect: pgDialect,
});
