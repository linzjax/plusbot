import { getFaunaError, getId, getDataField } from "../faunaUtils"
import { Client, fql, FaunaError, QuerySuccess, Document } from "fauna"
import invariant from "tiny-invariant"
// import faunadb from "faunadb"

type User = {
  user_id: string
  username: string
  company: Document
  plusses: number
}

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
  ":party-blob:",
  ":party_cat:",
  ":partycorgi:",
  ":dancing-dog:",
  ":mario_luigi:",
  ":party-doge:",
  ":party_parrot:",
  ":excited:",
  ":more_cowbell:"
]

const successMessage = [
  "Plusses for you",
  "Way to go",
  "Rock on",
  "Keep it up",
  "High five",
  "Look at you go",
  "You're doing great"
]

const birthdayMessages = [
  "Let's celebrate you",
  "It's your special day",
  "Let's party",
  "Happiest of birthdays",
  "Happy level-up day",
  "A day just for you"
]

/***
 * Parse body of the message to see the users that were tagged for plusses
 **/
const parseUsers = (text: string) => {
  return text
    .split(" ")
    .filter((user: string) => user.includes("<@"))
    .map((user: string) => {
      const userArray = user.split("|")
      const userId = userArray[0].slice(2, userArray[0].length)
      const username = userArray[1].split(">")[0]

      return {
        id: userId,
        username: username
      }
    })
}

const parseBirthdayMessage = (text: string) => {
  return /happy birthday|hbd/.test(text.toLowerCase())
}

const getRandomValue = (array: string[]) => {
  return array[Math.floor(Math.random() * array.length)]
}

export default async (body: any, faunaClient: Client) => {
  try {
    const plussesFor = parseUsers(body.text)
    const isBirthdayMessage = parseBirthdayMessage(body.text)

    const q = faunaClient.query

    const messages = await Promise.all(
      plussesFor.map(async (user: { username: string; id: string }) => {
        // Check if the user_id exists at all
        // If it does, increase the number of plusses by 1
        // If it does not, create a record for the user

        const findQuery = fql`Plusses.all().firstWhere(.user_id == "UJBF199DL")`
        console.log("find query:", JSON.stringify(findQuery))
        const response: QuerySuccess<User> = await q(findQuery)
        console.log("response:", response)
        const userDoc: User = response.data
        console.log("userDoc", userDoc)

        // const updateQuery = fql`${findQuery}!.update({ plusses: ${userDoc.plusses}})`

        // await faunaClient.query(updateQuery)

        return `:sparkles:${getRandomValue(coreValues)}:sparkles:   ${
          isBirthdayMessage
            ? getRandomValue(birthdayMessages)
            : getRandomValue(successMessage)
        } @${user.username}!    :sparkles:${getRandomValue(
          celebrateEmojis
        )}:sparkles:`
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
