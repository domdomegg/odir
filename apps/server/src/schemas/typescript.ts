/**
 * This file was automatically generated. DO NOT MODIFY IT BY HAND.
 * Instead, modify jsonSchema.ts, and run "npm run generate --workspace @odir/server"
 * (generate:schemas is run automatically if you're running the server).
 */
/* eslint-disable */

export type Email = string;

export type Ulid = string;

export interface Status {
  message: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: number;
  groups: string[];
}

export interface GoogleLoginRequest {
  idToken: string;
}

export interface ImpersonationLoginRequest {
  email: string;
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
  email: string;
  jobTitle?: string;
  grade?: string;
  linkedin?: string;
  about?: string;
  motivation?: string;
  policyBackground?: string;
  howSupportOthers?: string;
  howHelpMe?: string;
  profilePic?: string;
}

export interface PersonEdits {
  name?: string;
  email?: string;
  jobTitle?: string;
  grade?: string;
  linkedin?: string;
  about?: string;
  motivation?: string;
  policyBackground?: string;
  howSupportOthers?: string;
  howHelpMe?: string;
  profilePic?: string;
}

export interface Person {
  id: string;
  name: string;
  email: string;
  jobTitle?: string;
  grade?: string;
  linkedin?: string;
  about?: string;
  motivation?: string;
  policyBackground?: string;
  howSupportOthers?: string;
  howHelpMe?: string;
  profilePic?: string;
  lastEditedBy: string;
  lastEditedAt: number;
  createdAt: number;
}

export type Persons = {
  id: string;
  name: string;
  email: string;
  jobTitle?: string;
  grade?: string;
  linkedin?: string;
  about?: string;
  motivation?: string;
  policyBackground?: string;
  howSupportOthers?: string;
  howHelpMe?: string;
  profilePic?: string;
  lastEditedBy: string;
  lastEditedAt: number;
  createdAt: number;
}[];

export interface TeamCreation {
  name: string;
  type?: string;
  website?: string;
  vision?: string;
  mission?: string;
  priorities?: string;
  logo?: string;
  notes?: string;
}

export interface TeamEdits {
  name?: string;
  type?: string;
  website?: string;
  vision?: string;
  mission?: string;
  priorities?: string;
  logo?: string;
  notes?: string;
}

export interface Team {
  id: string;
  name: string;
  type?: string;
  website?: string;
  vision?: string;
  mission?: string;
  priorities?: string;
  logo?: string;
  notes?: string;
  lastEditedBy: string;
  lastEditedAt: number;
  createdAt: number;
}

export type Teams = {
  id: string;
  name: string;
  type?: string;
  website?: string;
  vision?: string;
  mission?: string;
  priorities?: string;
  logo?: string;
  notes?: string;
  lastEditedBy: string;
  lastEditedAt: number;
  createdAt: number;
}[];

export interface RelationCreation {
  parentId: string;
  childId: string;
  title?: string;
}

export interface RelationEdits {
  parentId?: string;
  childId?: string;
  title?: string;
}

export interface Relation {
  id: string;
  parentId: string;
  childId: string;
  title?: string;
}

export type Relations = {
  id: string;
  parentId: string;
  childId: string;
  title?: string;
}[];

export interface SearchRequest {
  query: string;
}

export interface SearchResponse {
  results: {
    id: string;
    url: string;
    title: string;
    subtitle?: {
      highlight?: boolean;
      text?: string;
      [k: string]: unknown;
    }[];
    type: "team" | "person";
    [k: string]: unknown;
  }[];
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

export interface UserCreation {
  name: string;
  email: string;
  groups: string[];
  securityTrainingCompletedAt: number;
  sendAccountCreationEmail: boolean;
}

export interface UserEdits {
  name?: string;
  email?: string;
  groups?: string[];
  securityTrainingCompletedAt?: number;
  sendAccountCreationEmail?: boolean;
}

export interface User {
  name: string;
  email: string;
  groups: string[];
  securityTrainingCompletedAt: number;
  sendAccountCreationEmail?: boolean;
  id: string;
}

export type Users = {
  name: string;
  email: string;
  groups: string[];
  securityTrainingCompletedAt: number;
  sendAccountCreationEmail?: boolean;
  id: string;
}[];
