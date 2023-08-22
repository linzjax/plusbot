import { QueryValueObject } from "fauna"

export interface User extends QueryValueObject {
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
