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
  console.log("contentType:", contentType)
  request.content = undefined
  try {
    if (contentType) {
      if (contentType.includes("application/x-www-form-urlencoded")) {
        console.log("made it here")
        console.log(await request.text())
        request.content = await request.body()
        console.log(request.content)
      }
    }
  } catch (err) {} // silently fail on error
  return request.content
}

router
  .post("/plusses", async (request, env, tools) => {
    // console.log("REQUEST", JSON.stringify(request))
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
  .get("*", async (request) => {
    return new Response("Page not found", { status: 404 })
  })

export default <ExportedHandler<EnvBindings>>{
  async fetch(request, env, context) {
    try {
      console.log("ORIGINAL request", request.headers.get("content-type"))
      const botAccessToken = env.SLACK_BOT_ACCESS_TOKEN
      const SlackAPI = new SlackREST({ botAccessToken })

      const signingSecret = env.SLACK_SIGNING_SECRET
      const isVerifiedRequest = await SlackAPI.helpers.verifyRequestSignature(
        request,
        signingSecret
      )

      console.log("isVerifiedRequest?", isVerifiedRequest)

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
