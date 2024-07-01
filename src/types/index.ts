export interface User {
  user_id: string
  username: string
  company: string
  plusses: number
}

export type SlackMessage = {
  token: string
  team_id: string
  team_domain: string
  channel_id: string
  channel_name: string
  user_id: string
  user_name: string
  command: "/++"
  text: string
  api_app_id: string
  is_enterprise_install: string
  response_url: string
  trigger_id: string
}

export type Bindings = {
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
