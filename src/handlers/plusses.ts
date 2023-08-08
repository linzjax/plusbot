import { getFaunaError, getId, getDataField } from "../faunaUtils"
import invariant from "tiny-invariant"
import faunadb from "faunadb"

export default async (body: any, faunaClient: faunadb.Client) => {
  try {
    const q = faunadb.query

    // Parse body of the message to see the users that were tagged for plusses
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
            // This function is stored in the fauna dashboard.
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

        const coreValues = [
          ":be_kind:",
          ":bring_the_magic:",
          ":think_it_through:",
          ":keep_it_simple:",
          ":find_a_way:",
          ":own_it:",
          ":be_authentic:"
        ]

        const celebrateEmojis = [
          ":highfive:",
          ":dancing-mage:",
          ":bananadance:",
          ":party_blob:",
          ":party_cat:",
          ":partycorgi:",
          ":dancing-dog:"
        ]

        const successMessage = [
          "Plusses for you",
          "Way to go",
          "Rock on",
          "Keep it up"
        ]

        const getRandomValue = (array: string[]) => {
          return array[Math.floor(Math.random() * array.length)]
        }

        return `:sparkles:${getRandomValue(
          coreValues
        )}:sparkles:   ${getRandomValue(successMessage)} @${
          user.username
        }!    :sparkles:${getRandomValue(celebrateEmojis)}:sparkles:`
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
