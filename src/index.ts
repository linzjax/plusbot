import SlackREST from "@sagi.io/workers-slack"
import { Router, IRequest } from "itty-router"
import faunadb from "faunadb"

import plusses from "./handlers/plusses"
import authorize from "./handlers/authorize"
import addToSlack from "./handlers/addToSlack"

const router = Router()

/**
 * For some reason, itty-router's withContent doesn't work with the way we've formatted our
 * handlers. So this is a direct copy of itty router's withContent function that we can use
 * inside the body of the callback.
 **/
export const getContent = async (request: IRequest) => {
  let contentType = request.headers.get("content-type")
  request.content = undefined
  try {
    if (contentType) {
      if (contentType.includes("application/json")) {
        request.content = await request.json()
      }
    }
  } catch (err) {} // silently fail on error
  return request.content
}

router
  .all("*", async (request: IRequest, env, tools) => {
    const signingSecret = env.SLACK_SIGNING_SECRET
    const isVerifiedRequest =
      await tools.SlackAPI.helpers.verifyRequestSignature(
        request,
        signingSecret
      )
  })
  .post("/plusses", async (request, env, tools) => {
    console.log("REQUEST", JSON.stringify(request))
    const content = await getContent(request)
    console.log(`CONTENT:`, content)
    return await plusses({ content }, tools.faunaClient)
  })

  // .post('/donotsell/list/add-customer', async (request, env) => {
  //     const content = await getContent(request)
  //     return await handleAddOptOutUser({ content }, env)
  //   })

  // new OAuth redirect url
  .get("/authorize", async (request, env, tools) => {
    authorize(request, env, tools.SlackAPI)
  })

export default <ExportedHandler<EnvBindings>>{
  async fetch(request, env, context) {
    try {
      const botAccessToken = env.SLACK_BOT_ACCESS_TOKEN
      const SlackAPI = new SlackREST({ botAccessToken })

      const faunaClient = new faunadb.Client({
        secret: env.FAUNADB_SECRET as string,
        domain: "db.fauna.com"
      })

      const response = await router.handle(request, env, {
        SlackAPI,
        faunaClient
      })
      return response
    } catch (e) {
      return new Response("Internal error. Contact #engineer-helpdesk.", {
        status: 500
      })
    }
  }
}
