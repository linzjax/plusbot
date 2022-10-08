import { getFaunaError, getId, getDataField } from "../utils"
import invariant from "tiny-invariant"
import faunadb from "faunadb"

export default (faunaClient) => async (request, response) => {
  try {
    const body = await request.body()

    invariant(body !== null, "Body request was empty")

    const q = faunadb.query
    /*

    {
      "token": "uchynaSVwpCsen11gvc4H7kQ",
      "team_id": "T045JP1N51T",
      "team_domain": "lindseysappfactory",
      "channel_id": "C045JP4PWTX",
      "channel_name": "plusbot",
      "user_id": "U045MMQ3ZDG",
      "user_name": "linzjax",
      "command": "/plusbot",
      "text": "<@U045MMQ3ZDG|linzjax>"
      "api_app_id": "A04575DJUDD",
      "is_enterprise_install": "false",
      "response_url": "https://hooks.slack.com/commands/T045JP1N51T/4218244674272/Mj3Q5WeLZOjHE34QSn5Kbw4Q",
      "trigger_id": "4197002111524.4188783753061.cf409fc3a8c3f06a0c44df6f680c5746"
    }
    */

    const plussesFor = body.text
      .split(" ")
      .filter((user: string) => user.includes("<@"))
      .map((user: string) => {
        const userArray = user.split("|")
        return {
          id: userArray[0].slice(2, userArray[0].length),
          username: userArray[1].slice(0, userArray[1].length - 1)
        }
      })

    const messages = await Promise.all(
      plussesFor.map(async (user: { username: string; id: string }) => {
        const result = await faunaClient.query(
          q.Call(
            q.Function("upsertPlusses"),
            q.Match(q.Index("plusses_by_user_id"), user.id),
            user.id,
            user.username,
            body.team_id
          )
        )

        const userUpdated: { [plusses: string]: number } =
          await faunaClient.query(
            q.Let(
              {
                u: q.Get(q.Match(q.Index("plusses_by_user_id"), user.id))
              },
              {
                plusses: getDataField("u", "plusses")
              }
            )
          )

        return `@${user.username} now has ${userUpdated.plusses} plusses!`
      })
    )

    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: messages.join("\n")
        }
      }
    ]

    return new Response(
      JSON.stringify({
        blocks,
        response_type: "in_channel"
      }),
      { headers: { "Content-type": "application/json" } }
    )
  } catch (error) {
    const faunaError = getFaunaError(error)
    console.log("An error occurred:", faunaError)
    response.send(faunaError.status, faunaError)
  }
}
