import SlackREST from "@sagi.io/workers-slack"
import invariant from "tiny-invariant"

export default (SlackAPI: SlackREST) => async (req, res) => {
  invariant(
    SLACK_CLIENT_ID !== undefined,
    `SLACK_CLIENT_ID is missing.\n
    This can be found under Basic Information -> App Credentials in your bot directory.`
  )
  invariant(
    SLACK_CLIENT_SECRET !== undefined,
    `SLACK_CLIENT_SECRET is missing.\n
    This can be found under Basic Information -> App Credentials in your bot directory.`
  )

  try {
    const response = await SlackAPI.oauth.v2.access({
      client_id: SLACK_CLIENT_ID,
      client_secret: SLACK_CLIENT_SECRET,
      code: req.query.get("code")
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
    res.send(
      200,
      `<html><body><p>You have successfully logged in with your slack account! Here are the details:</p><p>Response: ${JSON.stringify(
        response
      )}</p><p>Identity: ${JSON.stringify(identity)}</p></body></html>`
    )
  } catch (eek) {
    console.log(eek)
    res.send(500, `<html><body><p>Something went wrong!</p><p>${eek}</p>`)
  }
}
