import { Request as IttyRouterRequest } from "itty-router"

export {}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-empty-interface
  interface Request extends Pick<IttyRouterRequest, "params" | "query"> {}

  interface EnvBindings {
    KUDOS_MESSAGES: string
    BDAY_MESSAGES: string
    FRONT_EMOJIS: string
    BACK_EMOJIS: string
    SLACK_WEBHOOK_URL: string
    SLACK_SIGNING_SECRET: string
    SLACK_CLIENT_ID: string
    SLACK_CLIENT_SECRET: string
    SLACK_BOT_ACCESS_TOKEN: string
  }
}
