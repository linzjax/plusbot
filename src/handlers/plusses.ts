import { getFaunaError, getId, getDataField } from "../faunaUtils"
import invariant from "tiny-invariant"
import faunadb from "faunadb"

export default async ({ content }: any, faunaClient: faunadb.Client) => {
  try {
    const q = faunadb.query

    // Parse body of the message to see the users that were tagged for plusses
    const plussesFor = content.text
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
            // This function is stored in the fauna dashboard.
            q.Function("upsertPlusses"),
            q.Match(q.Index("plusses_by_user_id"), user.id),
            user.id,
            user.username,
            content.team_id
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
    console.log(error)
    const faunaError = getFaunaError(error)
    console.log("An error occurred:", faunaError)
    return new Response(JSON.stringify(faunaError), {
      status: faunaError.status
    })
  }
}
