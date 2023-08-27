import type {
  APIGatewayProxyEventV2, APIGatewayProxyResult, Handler, Context, APIGatewayProxyEventHeaders,
} from "aws-lambda"
import jwt from "jsonwebtoken"
import { ulid } from "ulid"
import { fixedGroups } from "@odir/shared"
import { AccessTokenPayload } from "../src/helpers/types"
import env from "../src/env/env"
import MockDate from 'mockdate';
import * as db from "../src/helpers/db"
import { AuditLog, Team } from "../src/schemas"

interface CallOptions {
  path?: string,
  routeKey?: string,
  pathParameters?: Record<string, string | undefined>,
  headers?: Record<string, string | undefined>,
  rawResponse?: boolean,
  auth?: Partial<AccessTokenPayload> | false | string,
  authKey?: string
  rawBody?: boolean,
}

export const testGroupId = "01GPYGNDBDHY9685YHRKWT6VE7";

export const call = (handler: Handler<APIGatewayProxyEventV2, APIGatewayProxyResult>, options: CallOptions = {}) => async (body: any): Promise<any> => {
  const now = Math.floor(new Date().getTime() / 1000)
  const token = typeof options.auth === "string" ? options.auth : jwt.sign(
    {
      subject: "tests",
      groups: [fixedGroups.Admin, testGroupId],
      iat: now,
      exp: now + 60, // 1 minute
      ...options.auth
    },
    options.authKey ?? env.JWT_PRIVATE_KEY,
    { algorithm: "ES256" },
  )

  process.env.AWS_REGION = 'eu-test-1';
  const response = await handler(
    {
      routeKey: options.routeKey ?? `UNKNOWN ${options.path ?? "/unknown"}`,
      rawPath: options.path ?? "/unknown",
      rawQueryString: "",
      headers: {
        authorization: options.auth === false ? undefined : `Bearer ${token}`,
        "content-type": "application/json; charset=utf-8",
        ...options.headers,
      } as APIGatewayProxyEventHeaders,
      requestContext: {
        accountId: "12345678",
        http: {
          method: "UNKNOWN",
          path: options.path ?? "/unknown",
          protocol: "HTTP/1.1",
          sourceIp: "123.123.123.123",
          userAgent: "some browser",
        },
      },
      body: body ? (options.rawBody ? body : JSON.stringify(body)) : null,
      pathParameters: options.pathParameters ?? {},
    } as APIGatewayProxyEventV2,
    {
      awsRequestId: "request-123456789",
      logGroupName: "aws/lambda/raise-server-stage-myFunc",
      logStreamName: "2022/01/01/[$LATEST]123456789",
    } as Context,
    () => { throw new Error("expected to return promise, not invoke callback") },
  )
  process.env.AWS_REGION = undefined;
  if (!response) throw new Error("No response returned")

  if (options.rawResponse) return response
  if (response.statusCode > 300) throw new Error(`Unexpected status: ${response.statusCode}, body is ${response.body}`)
  if (response.body === undefined) return undefined
  return JSON.parse(response.body)
}

export const makeTeam = <Override extends Partial<Team>>(override?: Override): Team & Override => ({
  id: ulid(),
  name: 'Teamy McTeamface',
  createdAt: Math.floor(new Date().getTime() / 1000),
  lastEditedAt: Math.floor(new Date().getTime() / 1000),
  lastEditedBy: ulid(),
  vision: 'A world that is cool',
  mission: 'Do cool things',
  ...override,
} as Team & Override)

export const makeAuditLog = <Override extends Partial<AuditLog>>(override?: Override): AuditLog & Override => ({
  id: ulid(),
  object: ulid(),
  subject: "raisenational@gmail.com",
  action: "edit",
  at: Math.floor(new Date().getTime() / 1000),
  sourceIp: "1.1.1.1",
  userAgent: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/1.2 Chrome/1.2.3.4 Safari/1.2",
  routeRaw: "GET /admin/somewhere",
  metadata: {
    extraDetailsLocation: "here",
  },
  ttl: null,
  ...override,
} as AuditLog & Override)

export const enableConsole = (): void => {
  (console.error as jest.MockedFunction<typeof console.error>).mockRestore();
  (console.warn as jest.MockedFunction<typeof console.warn>).mockRestore();
  (console.info as jest.MockedFunction<typeof console.info>).mockRestore();
  (console.log as jest.MockedFunction<typeof console.log>).mockRestore()
}

export const setMockDate = (value: Date | number) => {
  MockDate.set(typeof value === "number" ? value * 1000 : value)
}

const withDelay = <Y extends any[], T>(fn: (...args: Y) => Promise<T>) => async (...args: Y): Promise<T> => {
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 20))
  const result = await fn(...args)
  await new Promise((resolve) => setTimeout(resolve, Math.random() * 20))
  return result
}

export const delayDb = () => {
  const { scan, get, query, insert, update, inTransaction, } = db
  jest.spyOn(db, "scan").mockImplementation(withDelay(scan))
  jest.spyOn(db, "get").mockImplementation(withDelay(get))
  jest.spyOn(db, "query").mockImplementation(withDelay(query))
  jest.spyOn(db, "insert").mockImplementation(withDelay(insert))
  jest.spyOn(db, "update").mockImplementation(withDelay(update))
  jest.spyOn(db, "inTransaction").mockImplementation(withDelay(inTransaction))
}
