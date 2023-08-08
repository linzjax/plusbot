import { Request as IttyRouterRequest } from "itty-router"

export {}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Request extends Pick<IttyRouterRequest, "params" | "query"> {}

  interface EnvBindings {
    SLACK_WEBHOOK_URL: string
    SLACK_SIGNING_SECRET: string
    SLACK_CLIENT_ID: string
    SLACK_CLIENT_SECRET: string
    SLACK_BOT_ACCESS_TOKEN: string
    FAUNADB_SECRET: string
    FAUNADB_ENDPOINT: string
  }
}
