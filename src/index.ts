import SlackREST from "@sagi.io/workers-slack"
// https://hono.dev/
import { Hono } from "hono"
import { Client } from "fauna"
// import faunadb from "faunadb"

import plusses from "./handlers/plusses"
import authorize from "./handlers/authorize"
import addToSlack from "./handlers/addToSlack"

type Bindings = {
  SLACK_WEBHOOK_URL: string
  SLACK_SIGNING_SECRET: string
  SLACK_CLIENT_ID: string
  SLACK_CLIENT_SECRET: string
  SLACK_BOT_ACCESS_TOKEN: string
  FAUNADB_SECRET: string
  FAUNADB_ENDPOINT: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.post("/plusses", async (c) => {
  const faunaClient = new Client({
    secret: c.env.FAUNADB_SECRET as string
  })

  const body = await c.req.parseBody()
  return await plusses(body, faunaClient)
})

// new OAuth redirect url
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
