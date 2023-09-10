import {
  JSONSchema,
  $Person, Person,
  $Team, Team,
  $Relation, Relation,
  $AuditLog, AuditLog,
  $Group, Group,
  $User, User, Slug, $Slug, EmailLogin, $EmailLogin, $Domain, Domain,
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
  name: `odir-server-${env.STAGE}-person`,
  entityName: 'person',
  partitionKey: 'id',
  primaryKey: 'id',
  schema: $Person,
};

export const teamTable: Table<'id', 'id', Team> = {
  name: `odir-server-${env.STAGE}-team`,
  entityName: 'team',
  partitionKey: 'id',
  primaryKey: 'id',
  schema: $Team,
};

export const relationTable: Table<'id', 'id', Relation> = {
  name: `odir-server-${env.STAGE}-relation`,
  entityName: 'relation',
  partitionKey: 'id',
  primaryKey: 'id',
  schema: $Relation,
};

export const slugTable: Table<'id', 'id', Slug> = {
  name: `odir-server-${env.STAGE}-slug`,
  entityName: 'slug',
  partitionKey: 'id',
  primaryKey: 'id',
  schema: $Slug,
};

export const emailLoginTable: Table<'id', 'id', EmailLogin> = {
  name: `odir-server-${env.STAGE}-email-login`,
  entityName: 'email login',
  partitionKey: 'id',
  primaryKey: 'id',
  schema: $EmailLogin,
};

export const auditLogTable: Table<'object', 'id', AuditLog> = {
  name: `odir-server-${env.STAGE}-audit-log`,
  entityName: 'auditLog',
  partitionKey: 'object',
  primaryKey: 'id',
  schema: $AuditLog,
};

export const groupTable: Table<'id', 'id', Group> = {
  name: `odir-server-${env.STAGE}-group`,
  entityName: 'group',
  partitionKey: 'id',
  primaryKey: 'id',
  schema: $Group,
};

export const domainTable: Table<'id', 'id', Domain> = {
  name: `odir-server-${env.STAGE}-domain`,
  entityName: 'domain',
  partitionKey: 'id',
  primaryKey: 'id',
  schema: $Domain,
};

export const userTable: Table<'id', 'id', User> = {
  name: `odir-server-${env.STAGE}-user`,
  entityName: 'user',
  partitionKey: 'id',
  primaryKey: 'id',
  schema: $User,
};

export const tables = {
  team: teamTable,
  person: personTable,
  relation: relationTable,
  slug: slugTable,
  emailLogin: emailLoginTable,
  auditLog: auditLogTable,
  group: groupTable,
  domain: domainTable,
  user: userTable,
};
