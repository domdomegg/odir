import {
  ColumnType, Insertable, Selectable, Updateable
} from 'kysely';

export interface Database {
  person: PersonTable
  team: TeamTable
}
// create seperate file that creates table, call that from the overall program main function that start up the server,
// check if the table already exists it doesn't create it, this should be in keysley migrations
export interface PersonTable {
  id: ColumnType<string, string, never>
  name: string
  email: string
  jobTitle: string | null
  grade: string | null
  linkedin: string | null
  about: string | null
  motivation: string | null
  policyBackground: string | null
  howSupportOthers: string | null
  howHelpMe: string | null
  profilePic: string | null
  lastEditedAt: ColumnType<Date, Date | undefined, never>
  lastEditedPerson:string
  createdAt: ColumnType<Date, Date | undefined, never>
}

// You should not use the table schema interfaces directly. Instead, you should
// use the `Selectable`, `Insertable` and `Updateable` wrappers. These wrappers
// make sure that the correct types are used in each operation.
export type Person = Selectable<PersonTable>;
export type NewPerson = Insertable<PersonTable>;
export type PersonUpdate = Updateable<PersonTable>;

export interface TeamTable {
  id: ColumnType<number, never, never>
  name: string
  subTeams: string[], // CTEs?
  type: string,
  website: string,
  vision: string,
  mission: string,
  priorities: string,
  logo: string,
  notes: string,
}

// export interface TeamMembershipTable {
//   id: ColumnType<number, never, never>
// personId and teamid to be added here
// }

export type Team = Selectable<TeamTable>;
export type NewTeam = Insertable<TeamTable>;
export type TeamUpdate = Updateable<TeamTable>;
