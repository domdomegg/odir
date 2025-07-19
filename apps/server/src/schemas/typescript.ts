/**
 * This file was automatically generated. DO NOT MODIFY IT BY HAND.
 * Instead, modify jsonSchema.ts, and run "npm run generate --workspace @odir/server"
 * (generate:schemas is run automatically if you're running the server).
 */
/* eslint-disable */

export type Email = string;

export type Ulid = string;

export type Url = string;

export interface Status {
  message: string;
}

export type LoginMethod = "google" | "microsoft" | "gov-sso" | "email" | "impersonation";

export interface LoginMethodsResponse {
  methods: ("google" | "microsoft" | "gov-sso" | "email" | "impersonation")[];
}

export interface LoginResponse {
  accessToken: {
    value: string;
    expiresAt: number;
  };
  refreshToken: {
    value: string;
    expiresAt: number;
  };
  groups: string[];
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface GovSsoLoginRequest {
  idToken: string;
}

export interface ImpersonationLoginRequest {
  email: string;
}

export interface EmailInitiateLoginRequest {
  email: string;
}

export interface EmailLoginRequest {
  token: string;
}

export interface EmailLogin {
  id: string;
  email: string;
  createdAt: number;
  ttl: number;
}

export interface RefreshLoginRequest {
  refreshToken: string;
}

export interface Profile {
  email: string;
  groups: string[];
  issuedAt: number;
  expiresAt: number;
  sourceIp: string;
}

export interface PersonCreation {
  name: string;
  jobTitle?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  website?: string | null;
  about?: string | null;
  profilePic?: string | null;
  preferredSlug?: string;
}

export interface PersonEdits {
  name?: string;
  jobTitle?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  website?: string | null;
  about?: string | null;
  profilePic?: string | null;
  preferredSlug?: string;
}

export interface Person {
  id: string;
  name: string;
  jobTitle?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  website?: string | null;
  about?: string | null;
  profilePic?: string | null;
  preferredSlug: string;
  lastEditedBy: string;
  lastEditedAt: number;
  createdAt: number;
}

export type Persons = {
  id: string;
  name: string;
  jobTitle?: string | null;
  email?: string | null;
  phone?: string | null;
  linkedin?: string | null;
  website?: string | null;
  about?: string | null;
  profilePic?: string | null;
  preferredSlug: string;
  lastEditedBy: string;
  lastEditedAt: number;
  createdAt: number;
}[];

export interface TeamCreation {
  name: string;
  website?: string | null;
  about?: string | null;
  profilePic?: string | null;
  preferredSlug?: string;
}

export interface TeamEdits {
  name?: string;
  website?: string | null;
  about?: string | null;
  profilePic?: string | null;
  preferredSlug?: string;
}

export interface Team {
  id: string;
  name: string;
  website?: string | null;
  about?: string | null;
  profilePic?: string | null;
  preferredSlug: string;
  lastEditedBy: string;
  lastEditedAt: number;
  createdAt: number;
}

export type Teams = {
  id: string;
  name: string;
  website?: string | null;
  about?: string | null;
  profilePic?: string | null;
  preferredSlug: string;
  lastEditedBy: string;
  lastEditedAt: number;
  createdAt: number;
}[];

export interface Slug {
  id: string;
  type: "person" | "team";
  value: string;
  underlyingId: string;
}

export type Slugs = {
  id: string;
  type: "person" | "team";
  value: string;
  underlyingId: string;
}[];

export interface RelationCreation {
  childId: string;
  parentId: string;
  type: "PART_OF" | "MEMBER_OF" | "LINE_MANGED_BY" | "MANAGER_OF";
  title?: string | null;
}

export interface RelationEdits {
  childId?: string;
  parentId?: string;
  type?: "PART_OF" | "MEMBER_OF" | "LINE_MANGED_BY" | "MANAGER_OF";
  title?: string | null;
}

export interface Relation {
  id: string;
  childId: string;
  parentId: string;
  type: "PART_OF" | "MEMBER_OF" | "LINE_MANGED_BY" | "MANAGER_OF";
  title?: string | null;
}

export type Relations = {
  id: string;
  childId: string;
  parentId: string;
  type: "PART_OF" | "MEMBER_OF" | "LINE_MANGED_BY" | "MANAGER_OF";
  title?: string | null;
}[];

export type EntityResponse =
  | {
      type: "team";
      team: {
        id: string;
        name: string;
        website?: string | null;
        about?: string | null;
        profilePic?: string | null;
        preferredSlug: string;
        lastEditedBy: string;
        lastEditedAt: number;
        createdAt: number;
      };
      breadcrumbs: {
        id: string;
        name: string;
        website?: string | null;
        about?: string | null;
        profilePic?: string | null;
        preferredSlug: string;
        lastEditedBy: string;
        lastEditedAt: number;
        createdAt: number;
      }[];
      relations: {
        id: string;
        childId: string;
        parentId: string;
        type: "PART_OF" | "MEMBER_OF" | "LINE_MANGED_BY" | "MANAGER_OF";
        title?: string | null;
      }[];
      teams: {
        id: string;
        name: string;
        website?: string | null;
        about?: string | null;
        profilePic?: string | null;
        preferredSlug: string;
        lastEditedBy: string;
        lastEditedAt: number;
        createdAt: number;
      }[];
      persons: {
        id: string;
        name: string;
        jobTitle?: string | null;
        email?: string | null;
        phone?: string | null;
        linkedin?: string | null;
        website?: string | null;
        about?: string | null;
        profilePic?: string | null;
        preferredSlug: string;
        lastEditedBy: string;
        lastEditedAt: number;
        createdAt: number;
      }[];
      slugs: {
        id: string;
        type: "person" | "team";
        value: string;
        underlyingId: string;
      }[];
      hasDetailedAccess: boolean;
    }
  | {
      type: "person";
      person: {
        id: string;
        name: string;
        jobTitle?: string | null;
        email?: string | null;
        phone?: string | null;
        linkedin?: string | null;
        website?: string | null;
        about?: string | null;
        profilePic?: string | null;
        preferredSlug: string;
        lastEditedBy: string;
        lastEditedAt: number;
        createdAt: number;
      };
      relations: {
        id: string;
        childId: string;
        parentId: string;
        type: "PART_OF" | "MEMBER_OF" | "LINE_MANGED_BY" | "MANAGER_OF";
        title?: string | null;
      }[];
      teams: {
        id: string;
        name: string;
        website?: string | null;
        about?: string | null;
        profilePic?: string | null;
        preferredSlug: string;
        lastEditedBy: string;
        lastEditedAt: number;
        createdAt: number;
      }[];
      persons: {
        id: string;
        name: string;
        jobTitle?: string | null;
        email?: string | null;
        phone?: string | null;
        linkedin?: string | null;
        website?: string | null;
        about?: string | null;
        profilePic?: string | null;
        preferredSlug: string;
        lastEditedBy: string;
        lastEditedAt: number;
        createdAt: number;
      }[];
      slugs: {
        id: string;
        type: "person" | "team";
        value: string;
        underlyingId: string;
      }[];
      hasDetailedAccess: boolean;
    };

export interface SearchRequest {
  query: string;
  types?: ("team" | "person")[];
}

export interface SearchResponse {
  results: {
    id: string;
    slug: string;
    title: string;
    subtitle?: {
      highlight: boolean;
      text: string;
    }[];
    type: "team" | "person";
  }[];
}

export interface BlobCreation {
  data: string;
}

export type AuditLogMetadata =
  | null
  | boolean
  | number
  | string
  | AuditLogMetadata[]
  | {
      [k: string]: AuditLogMetadata;
    };

export interface AuditLog {
  id: string;
  object: string;
  subject: string;
  action: "create" | "edit" | "login" | "plus" | "security" | "run";
  at: number;
  sourceIp: string;
  userAgent: string;
  routeRaw: string;
  metadata: {
    [k: string]: AuditLogMetadata;
  };
  ttl: number | null;
}

export type AuditLogs = {
  id: string;
  object: string;
  subject: string;
  action: "create" | "edit" | "login" | "plus" | "security" | "run";
  at: number;
  sourceIp: string;
  userAgent: string;
  routeRaw: string;
  metadata: {
    [k: string]: AuditLogMetadata;
  };
  ttl: number | null;
}[];

export interface Task {
  id: string;
  name: string;
  groups: string[];
}

export type Tasks = {
  id: string;
  name: string;
  groups: string[];
}[];

export interface GroupCreation {
  name: string;
}

export interface GroupEdits {
  name?: string;
}

export interface Group {
  name: string;
  id: string;
}

export type Groups = {
  name: string;
  id: string;
}[];

export interface DomainCreation {
  name: string;
  domain: string;
  groups: string[];
  loginMethods: ("google" | "microsoft" | "gov-sso" | "email" | "impersonation")[];
}

export interface DomainEdits {
  name?: string;
  domain?: string;
  groups?: string[];
  loginMethods?: ("google" | "microsoft" | "gov-sso" | "email" | "impersonation")[];
}

export interface Domain {
  name: string;
  domain: string;
  groups: string[];
  loginMethods: ("google" | "microsoft" | "gov-sso" | "email" | "impersonation")[];
  id: string;
}

export type Domains = {
  name: string;
  domain: string;
  groups: string[];
  loginMethods: ("google" | "microsoft" | "gov-sso" | "email" | "impersonation")[];
  id: string;
}[];

export interface UserCreation {
  name: string;
  email: string;
  groups: string[];
  sendAccountCreationEmail: boolean;
}

export interface UserEdits {
  name?: string;
  email?: string;
  groups?: string[];
  sendAccountCreationEmail?: boolean;
}

export interface User {
  name: string;
  email: string;
  groups: string[];
  sendAccountCreationEmail?: boolean;
  id: string;
}

export type Users = {
  name: string;
  email: string;
  groups: string[];
  sendAccountCreationEmail?: boolean;
  id: string;
}[];
