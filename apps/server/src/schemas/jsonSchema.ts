import type { JSONSchema7Definition } from 'json-schema';
import type * as S from './typescript';

// It'd be nice to use JSONSchemaType from AJV. However, it has poor performance and is incorrect: https://github.com/ajv-validator/ajv/issues/1664
export type JSONSchema<T> = JSONSchema7Definition & { __type?: T };

export const $Email: JSONSchema<S.Email> = {
  type: 'string',
  // Regex from https://html.spec.whatwg.org/multipage/forms.html#e-mail-state-(type=email)
  pattern: "^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$",
};

export const $Ulid: JSONSchema<S.Ulid> = {
  type: 'string',
  // spell-checker: disable-next-line
  pattern: '^[0123456789ABCDEFGHJKMNPQRSTVWXYZ]{26}$',
};

export const $Status: JSONSchema<S.Status> = {
  type: 'object',
  properties: {
    message: { type: 'string' },
  },
  required: ['message'],
  additionalProperties: false,
};

export const $LoginResponse: JSONSchema<S.LoginResponse> = {
  type: 'object',
  properties: {
    accessToken: {
      type: 'object',
      properties: {
        value: { type: 'string' },
        expiresAt: { type: 'integer' },
      },
      required: ['value', 'expiresAt']
    },
    refreshToken: {
      type: 'object',
      properties: {
        value: { type: 'string' },
        expiresAt: { type: 'integer' },
      },
      required: ['value', 'expiresAt']
    },
    groups: { type: 'array', items: { type: 'string' } },
  },
  required: ['accessToken', 'refreshToken', 'groups'],
  additionalProperties: false,
};

export const $GoogleLoginRequest: JSONSchema<S.GoogleLoginRequest> = {
  type: 'object',
  properties: {
    idToken: { type: 'string' },
  },
  required: ['idToken'],
  additionalProperties: false,
};

export const $ImpersonationLoginRequest: JSONSchema<S.ImpersonationLoginRequest> = {
  type: 'object',
  properties: {
    email: $Email,
  },
  required: ['email'],
  additionalProperties: false,
};

export const $RefreshLoginRequest: JSONSchema<S.RefreshLoginRequest> = {
  type: 'object',
  properties: {
    refreshToken: { type: 'string' },
  },
  required: ['refreshToken'],
  additionalProperties: false,
};

export const $Profile: JSONSchema<S.Profile> = {
  type: 'object',
  properties: {
    email: { type: 'string' },
    groups: { type: 'array', items: { type: 'string' } },
    issuedAt: { type: 'integer' },
    expiresAt: { type: 'integer' },
    sourceIp: { type: 'string' },
  },
  required: ['email', 'groups', 'issuedAt', 'expiresAt', 'sourceIp'],
  additionalProperties: false,
};

export const $PersonCreation: JSONSchema<S.PersonCreation> = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    jobTitle: { type: 'string' },
    grade: { type: 'string' },
    linkedin: { type: 'string' },
    about: { type: 'string' },
    motivation: { type: 'string' },
    policyBackground: { type: 'string' },
    howSupportOthers: { type: 'string' },
    howHelpMe: { type: 'string' },
    profilePic: { type: 'string' },
  },
  required: ['name', 'email'],
  additionalProperties: false,
};

export const $PersonEdits: JSONSchema<S.PersonEdits> = {
  type: 'object',
  properties: {
    ...$PersonCreation.properties,
  },
  minProperties: 1,
  additionalProperties: false,
};

export const $Person: JSONSchema<S.Person> = {
  type: 'object',
  properties: {
    id: $Ulid,
    ...$PersonCreation.properties,
    lastEditedBy: { type: 'string' },
    lastEditedAt: { type: 'integer' },
    createdAt: { type: 'integer' },
  },
  required: ['id', ...$PersonCreation.required as string[], 'lastEditedBy', 'lastEditedAt', 'createdAt'],
  additionalProperties: false,
};

export const $Persons: JSONSchema<S.Person[]> = { type: 'array', items: $Person };

export const $TeamCreation: JSONSchema<S.TeamCreation> = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    type: { type: 'string' },
    website: { type: 'string' },
    vision: { type: 'string' },
    mission: { type: 'string' },
    priorities: { type: 'string' },
    logo: { type: 'string' },
    notes: { type: 'string' },
  },
  required: ['name'],
  additionalProperties: false,
};

export const $TeamEdits: JSONSchema<S.TeamEdits> = {
  type: 'object',
  properties: {
    ...$TeamCreation.properties,
  },
  minProperties: 1,
  additionalProperties: false,
};

export const $Team: JSONSchema<S.Team> = {
  type: 'object',
  properties: {
    id: $Ulid,
    ...$TeamCreation.properties,
    lastEditedBy: { type: 'string' },
    lastEditedAt: { type: 'integer' },
    createdAt: { type: 'integer' },
  },
  required: ['id', 'name', 'lastEditedBy', 'lastEditedAt', 'createdAt'],
  additionalProperties: false,
};

export const $Teams: JSONSchema<S.Team[]> = { type: 'array', items: $Team };

export const $RelationCreation: JSONSchema<S.RelationCreation> = {
  type: 'object',
  properties: {
    parentId: { type: 'string' },
    childId: { type: 'string' },
    title: { type: 'string' },
  },
  required: ['parentId', 'childId'],
  additionalProperties: false,
};

export const $RelationEdits: JSONSchema<S.RelationEdits> = {
  type: 'object',
  properties: {
    ...$RelationCreation.properties,
  },
  minProperties: 1,
  additionalProperties: false,
};

export const $Relation: JSONSchema<S.Relation> = {
  type: 'object',
  properties: {
    id: $Ulid,
    ...$RelationCreation.properties,
  },
  required: ['id', 'parentId', 'childId'],
  additionalProperties: false,
};

export const $Relations: JSONSchema<S.Relation[]> = { type: 'array', items: $Relation };

export const $SearchRequest: JSONSchema<S.SearchRequest> = {
  type: 'object',
  properties: {
    query: { type: 'string' },
  },
  required: ['query'],
  additionalProperties: false,
};

export const $SearchResponse: JSONSchema<S.SearchResponse> = {
  type: 'object',
  properties: {
    results: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          url: { type: 'string' },
          title: { type: 'string' },
          subtitle: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                highlight: { type: 'boolean' },
                text: { type: 'string' },
              }
            }
          },
          type: { enum: ['team', 'person'] },
        },
        required: ['id', 'url', 'title', 'type']
      }
    },
  },
  required: ['results'],
  additionalProperties: false,
};

export const $AuditLog: JSONSchema<S.AuditLog> = {
  type: 'object',
  properties: {
    id: $Ulid,
    object: { type: 'string' }, // a thing that can be created/edited e.g. a donation. If non-existent (e.g. for logins), same as id.
    subject: { type: 'string' }, // e.g. a admin user email, "public" | "stripe" | "scheduler"
    action: { enum: ['create', 'edit', 'login', 'plus', 'security', 'run'] },
    at: { type: 'integer' },
    sourceIp: { type: 'string' },
    userAgent: { type: 'string' },
    routeRaw: { type: 'string' },
    metadata: { type: 'object', additionalProperties: { $ref: '#/definitions/auditLogMetadata' } },
    ttl: { type: ['number', 'null'] }, // https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/TTL.html
  },
  required: ['id', 'object', 'subject', 'action', 'at', 'sourceIp', 'userAgent', 'routeRaw', 'metadata', 'ttl'],
  additionalProperties: false,
  definitions: {
    auditLogMetadata: {
      oneOf: [
        { type: 'null' },
        { type: 'boolean' },
        { type: 'number' },
        { type: 'string' },
        { type: 'array', items: { $ref: '#/definitions/auditLogMetadata' } },
        { type: 'object', additionalProperties: { $ref: '#/definitions/auditLogMetadata' } },
      ],
    },
  },
};

export const $AuditLogs: JSONSchema<S.AuditLog[]> = { type: 'array', items: $AuditLog, definitions: $AuditLog.definitions };

export const $Task: JSONSchema<S.Task> = {
  type: 'object',
  properties: {
    id: $Ulid,
    name: { type: 'string' },
    groups: { type: 'array', items: { type: 'string' } },
  },
  required: ['id', 'name', 'groups'],
  additionalProperties: false,
};

export const $Tasks: JSONSchema<S.Task[]> = { type: 'array', items: $Task };

export const $GroupCreation: JSONSchema<S.GroupCreation> = {
  type: 'object',
  properties: {
    name: { type: 'string' },
  },
  additionalProperties: false,
  required: ['name'],
};

export const $GroupEdits: JSONSchema<S.GroupEdits> = {
  type: 'object',
  properties: {
    ...$GroupCreation.properties,
  },
  minProperties: 1,
  additionalProperties: false,
};

export const $Group: JSONSchema<S.Group> = {
  type: 'object',
  properties: {
    ...$GroupCreation.properties,
    id: $Ulid,
  },
  required: ['id', 'name'],
  additionalProperties: false,
};

export const $Groups: JSONSchema<S.Group[]> = { type: 'array', items: $Group };

export const $UserCreation: JSONSchema<S.UserCreation> = {
  type: 'object',
  properties: {
    name: { type: 'string' },
    email: { type: 'string' },
    groups: { type: 'array', items: $Ulid },
    securityTrainingCompletedAt: { type: 'integer' },
    sendAccountCreationEmail: { type: 'boolean' }
  },
  additionalProperties: false,
  required: ['name', 'email', 'groups', 'securityTrainingCompletedAt', 'sendAccountCreationEmail'],
};

export const $UserEdits: JSONSchema<S.UserEdits> = {
  type: 'object',
  properties: {
    ...$UserCreation.properties,
  },
  minProperties: 1,
  additionalProperties: false,
};

export const $User: JSONSchema<S.User> = {
  type: 'object',
  properties: {
    ...$UserCreation.properties,
    id: $Ulid,
  },
  required: ['id', 'name', 'email', 'groups', 'securityTrainingCompletedAt'],
  additionalProperties: false,
};

export const $Users: JSONSchema<S.User[]> = { type: 'array', items: $User };
