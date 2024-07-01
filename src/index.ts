import SlackREST from "@sagi.io/workers-slack"
// https://hono.dev/
import { Hono } from "hono"
import { Client } from "fauna"

import plusses from "./handlers/plusses"
import authorize from "./handlers/authorize"
import { SlackMessage, Bindings } from "./types"

const app = new Hono<{ Bindings: Bindings }>()

app.post("/plusses", async (c) => {
  const frontEmojis = c.env.FRONT_EMOJIS?.split("\n") || [":heart:"]
  const backEmojis = c.env.BACK_EMOJIS?.split("\n") || [":tada:"]
  const kudosMessages = c.env.KUDOS_MESSAGES?.split("\n") || ["Way to go"]
  const bdayMessages = c.env.BDAY_MESSAGES?.split("\n") || [
    "Let's celebrate you"
  ]
  const body = await c.req.parseBody()
  return await plusses(
    body as SlackMessage,
    frontEmojis,
    backEmojis,
    kudosMessages,
    bdayMessages
  )
})

/**
 * new OAuth redirect url
 **/
app.get("/authorize", async (c) => {
  const botAccessToken = c.env.SLACK_BOT_ACCESS_TOKEN
  const SlackAPI = new SlackREST({ botAccessToken })
  authorize(c.req, c.env, SlackAPI)
})

app.get("*", async (request) => {
  return new Response("Page not found", { status: 404 })
})

export default <ExportedHandler<EnvBindings>>{
  async fetch(request, env, context) {
    try {
      const botAccessToken = env.SLACK_BOT_ACCESS_TOKEN
      const SlackAPI = new SlackREST({ botAccessToken })

      // If this is not a valid request from slack, it will throw an error.
      // Otherwise, isVerifiedRequest is true
      const signingSecret = env.SLACK_SIGNING_SECRET
      const isVerifiedRequest = await SlackAPI.helpers.verifyRequestSignature(
        request,
        signingSecret
      )

      return app.fetch(request, env, context)
    } catch (e) {
      console.log(e)
      return new Response("Internal error. Contact #engineer-helpdesk.", {
        status: 500
      })
    }
  }
}
