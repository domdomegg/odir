/**
 * This file was automatically generated. DO NOT MODIFY IT BY HAND.
 * Instead, modify the server, and run "npm run generate:client" from the server.
 */
/* eslint-disable */

import axios, { AxiosInstance, AxiosResponse } from "axios"
import type * as S from "./types"

export * from "./types"

export type Routes = {
  "get /admin/audit-logs/by-object/{objectId}": {
    request: null,
    response: S.AuditLogs,
    params: {
      "objectId": string,
    },
  },
  "get /admin/audit-logs/by-subject/{subjectId}": {
    request: null,
    response: S.AuditLogs,
    params: {
      "subjectId": string,
    },
  },
  "get /admin/groups": {
    request: null,
    response: S.Groups,
    params: null,
  },
  "post /admin/groups": {
    request: S.GroupCreation,
    response: S.Ulid,
    params: null,
  },
  "patch /admin/groups/{groupId}": {
    request: S.GroupEdits,
    response: null,
    params: {
      "groupId": string,
    },
  },
  "get /admin/login": {
    request: null,
    response: S.Profile,
    params: null,
  },
  "post /admin/login/google": {
    request: S.GoogleLoginRequest,
    response: S.LoginResponse,
    params: null,
  },
  "post /admin/login/impersonation": {
    request: S.ImpersonationLoginRequest,
    response: S.LoginResponse,
    params: null,
  },
  "post /admin/login/refresh": {
    request: S.RefreshLoginRequest,
    response: S.LoginResponse,
    params: null,
  },
  "get /admin/persons": {
    request: null,
    response: S.Persons,
    params: null,
  },
  "post /admin/search": {
    request: S.SearchRequest,
    response: S.SearchResponse,
    params: null,
  },
  "get /admin/tasks": {
    request: null,
    response: S.Tasks,
    params: null,
  },
  "post /admin/tasks/{taskId}": {
    request: null,
    response: null,
    params: {
      "taskId": string,
    },
  },
  "get /admin/teams": {
    request: null,
    response: S.Teams,
    params: null,
  },
  "post /admin/teams": {
    request: S.TeamCreation,
    response: S.Ulid,
    params: null,
  },
  "get /admin/teams/{teamId}": {
    request: null,
    response: S.Team,
    params: {
      "teamId": string,
    },
  },
  "patch /admin/teams/{teamId}": {
    request: S.TeamEdits,
    response: null,
    params: {
      "teamId": string,
    },
  },
  "get /admin/users": {
    request: null,
    response: S.Users,
    params: null,
  },
  "post /admin/users": {
    request: S.UserCreation,
    response: S.Ulid,
    params: null,
  },
  "patch /admin/users/{userId}": {
    request: S.UserEdits,
    response: null,
    params: {
      "userId": string,
    },
  },
  "get /public/status": {
    request: null,
    response: S.Status,
    params: null,
  },
  "post /scheduler/collect-payments": {
    request: null,
    response: null,
    params: null,
  },
}

export const routes = {
  "get /admin/audit-logs/by-object/{objectId}": {
    method: "get",
    makePath: ({
      objectId,
    }: {
      objectId: string,
    }) => `/admin/audit-logs/by-object/${objectId}`,
    hasRequest: false,
    hasResponse: true,
    hasParams: true,
  },
  "get /admin/audit-logs/by-subject/{subjectId}": {
    method: "get",
    makePath: ({
      subjectId,
    }: {
      subjectId: string,
    }) => `/admin/audit-logs/by-subject/${subjectId}`,
    hasRequest: false,
    hasResponse: true,
    hasParams: true,
  },
  "get /admin/groups": {
    method: "get",
    makePath: ({ }: {}) => `/admin/groups`,
    hasRequest: false,
    hasResponse: true,
    hasParams: false,
  },
  "post /admin/groups": {
    method: "post",
    makePath: ({ }: {}) => `/admin/groups`,
    hasRequest: true,
    hasResponse: true,
    hasParams: false,
  },
  "patch /admin/groups/{groupId}": {
    method: "patch",
    makePath: ({
      groupId,
    }: {
      groupId: string,
    }) => `/admin/groups/${groupId}`,
    hasRequest: true,
    hasResponse: false,
    hasParams: true,
  },
  "get /admin/login": {
    method: "get",
    makePath: ({ }: {}) => `/admin/login`,
    hasRequest: false,
    hasResponse: true,
    hasParams: false,
  },
  "post /admin/login/google": {
    method: "post",
    makePath: ({ }: {}) => `/admin/login/google`,
    hasRequest: true,
    hasResponse: true,
    hasParams: false,
  },
  "post /admin/login/impersonation": {
    method: "post",
    makePath: ({ }: {}) => `/admin/login/impersonation`,
    hasRequest: true,
    hasResponse: true,
    hasParams: false,
  },
  "post /admin/login/refresh": {
    method: "post",
    makePath: ({ }: {}) => `/admin/login/refresh`,
    hasRequest: true,
    hasResponse: true,
    hasParams: false,
  },
  "get /admin/persons": {
    method: "get",
    makePath: ({ }: {}) => `/admin/persons`,
    hasRequest: false,
    hasResponse: true,
    hasParams: false,
  },
  "post /admin/search": {
    method: "post",
    makePath: ({ }: {}) => `/admin/search`,
    hasRequest: true,
    hasResponse: true,
    hasParams: false,
  },
  "get /admin/tasks": {
    method: "get",
    makePath: ({ }: {}) => `/admin/tasks`,
    hasRequest: false,
    hasResponse: true,
    hasParams: false,
  },
  "post /admin/tasks/{taskId}": {
    method: "post",
    makePath: ({
      taskId,
    }: {
      taskId: string,
    }) => `/admin/tasks/${taskId}`,
    hasRequest: false,
    hasResponse: false,
    hasParams: true,
  },
  "get /admin/teams": {
    method: "get",
    makePath: ({ }: {}) => `/admin/teams`,
    hasRequest: false,
    hasResponse: true,
    hasParams: false,
  },
  "post /admin/teams": {
    method: "post",
    makePath: ({ }: {}) => `/admin/teams`,
    hasRequest: true,
    hasResponse: true,
    hasParams: false,
  },
  "get /admin/teams/{teamId}": {
    method: "get",
    makePath: ({
      teamId,
    }: {
      teamId: string,
    }) => `/admin/teams/${teamId}`,
    hasRequest: false,
    hasResponse: true,
    hasParams: true,
  },
  "patch /admin/teams/{teamId}": {
    method: "patch",
    makePath: ({
      teamId,
    }: {
      teamId: string,
    }) => `/admin/teams/${teamId}`,
    hasRequest: true,
    hasResponse: false,
    hasParams: true,
  },
  "get /admin/users": {
    method: "get",
    makePath: ({ }: {}) => `/admin/users`,
    hasRequest: false,
    hasResponse: true,
    hasParams: false,
  },
  "post /admin/users": {
    method: "post",
    makePath: ({ }: {}) => `/admin/users`,
    hasRequest: true,
    hasResponse: true,
    hasParams: false,
  },
  "patch /admin/users/{userId}": {
    method: "patch",
    makePath: ({
      userId,
    }: {
      userId: string,
    }) => `/admin/users/${userId}`,
    hasRequest: true,
    hasResponse: false,
    hasParams: true,
  },
  "get /public/status": {
    method: "get",
    makePath: ({ }: {}) => `/public/status`,
    hasRequest: false,
    hasResponse: true,
    hasParams: false,
  },
  "post /scheduler/collect-payments": {
    method: "post",
    makePath: ({ }: {}) => `/scheduler/collect-payments`,
    hasRequest: false,
    hasResponse: false,
    hasParams: false,
  },
} as const

export const makeClient = (a: AxiosInstance = axios) => <
  Route extends keyof Routes,
  Data extends Routes[Route]["request"],
  Params extends Routes[Route]["params"],
  Result extends Routes[Route]["response"],
  >(
    route: Route,
    ...args: [
      ...Params extends null ? [] : [params: Params],
      ...Data extends null ? [] : [data: Data],
    ]
  ): Promise<AxiosResponse<Result>> => {
  const paramsIndex = routes[route].hasParams ? 0 : null;
  const dataIndex = routes[route].hasRequest ? (routes[route].hasParams ? 1 : 0) : null;

  return a({
    method: routes[route].method,
    url: routes[route].makePath(paramsIndex === null ? {} as any : args[paramsIndex]),
    data: dataIndex !== null ? args[dataIndex] : undefined,
  });
}