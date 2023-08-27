import {
  JSONSchema,
  $Person, Person,
  $Team, Team,
  $Relation, Relation,
  $AuditLog, AuditLog,
  $Group, Group,
  $User, User,
} from '../schemas';
import env from '../env/env';

export type DBAttributeValue = null | boolean | number | string | DBAttributeValue[] | { [key: string]: DBAttributeValue };

export interface Table<
  PartitionKey extends string,
  PrimaryKey extends string,
  Schema extends { [K in keyof Schema]: DBAttributeValue } & Key,
  Key extends Record<PartitionKey | PrimaryKey, string> = Record<PartitionKey | PrimaryKey, string>,
  // TODO: consider moving this logic to the db types, rather than table type
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  Edits extends { [K in keyof Schema]?: K extends keyof Key ? never : Schema[K] } = { [K in keyof Schema]?: K extends keyof Key ? never : Schema[K] },
  > {
  name: string,
  entityName: string,
  partitionKey: PartitionKey,
  primaryKey: PrimaryKey,
  schema: JSONSchema<Schema>,
}

export const personTable: Table<'id', 'id', Person> = {
  name: `raise-server-${env.STAGE}-person`,
  entityName: 'person',
  partitionKey: 'id',
  primaryKey: 'id',
  schema: $Person,
};

export const teamTable: Table<'id', 'id', Team> = {
  name: `raise-server-${env.STAGE}-team`,
  entityName: 'team',
  partitionKey: 'id',
  primaryKey: 'id',
  schema: $Team,
};

export const relationTable: Table<'id', 'id', Relation> = {
  name: `raise-server-${env.STAGE}-relation`,
  entityName: 'relation',
  partitionKey: 'id',
  primaryKey: 'id',
  schema: $Relation,
};

export const auditLogTable: Table<'object', 'id', AuditLog> = {
  name: `raise-server-${env.STAGE}-audit-log`,
  entityName: 'auditLog',
  partitionKey: 'object',
  primaryKey: 'id',
  schema: $AuditLog,
};

export const groupTable: Table<'id', 'id', Group> = {
  name: `raise-server-${env.STAGE}-group`,
  entityName: 'group',
  partitionKey: 'id',
  primaryKey: 'id',
  schema: $Group,
};

export const userTable: Table<'id', 'id', User> = {
  name: `raise-server-${env.STAGE}-user`,
  entityName: 'user',
  partitionKey: 'id',
  primaryKey: 'id',
  schema: $User,
};

export const tables = {
  team: teamTable,
  person: personTable,
  relation: relationTable,
  auditLog: auditLogTable,
  group: groupTable,
  user: userTable,
};
