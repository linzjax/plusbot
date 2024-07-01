import SlackREST from "@sagi.io/workers-slack"
import invariant from "tiny-invariant"
import { IRequest } from "itty-router"
import { Bindings } from "../types"

export default async (
  request: IRequest,
  env: Bindings,
  SlackAPI: SlackREST
) => {
  invariant(
    env.SLACK_CLIENT_ID !== undefined,
    `SLACK_CLIENT_ID is missing.\n
    This can be found under Basic Information -> App Credentials in your bot directory.`
  )
  invariant(
    env.SLACK_CLIENT_SECRET !== undefined,
    `SLACK_CLIENT_SECRET is missing.\n
    This can be found under Basic Information -> App Credentials in your bot directory.`
  )

  try {
    const response = await SlackAPI.oauth.v2.access({
      client_id: env.SLACK_CLIENT_ID,
      client_secret: env.SLACK_CLIENT_SECRET,
      code: request.query.get("code")
    })

    invariant(
      response.authed_user !== undefined,
      `response.authed_user is missing.\n
      This is necessary to install the app.`
    )

    const identity = await SlackAPI.users.identity({
      token: response.authed_user.access_token
    })

    // At this point you can assume the user has logged in successfully with their account.
    return new Response(
      `<html><body><p>You have successfully logged in with your slack account! Here are the details:</p><p>Response: ${JSON.stringify(
        response
      )}</p><p>Identity: ${JSON.stringify(identity)}</p></body></html>`,
      { status: 200 }
    )
  } catch (eek) {
    console.log(eek)
    return new Response(
      `<html><body><p>Something went wrong!</p><p>${eek}</p>`,
      { status: 500 }
    )
  }
}
