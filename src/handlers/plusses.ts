import { getFaunaError } from "../faunaUtils"
import { Client, fql, QuerySuccess } from "fauna"
import { User, SlackMessage } from "../types"

const coreValues = [
  ":be-kind:",
  ":bring-the-magic:",
  ":think-it-through:",
  ":keep-it-simple:",
  ":find-a-way:",
  ":own-it:",
  ":be-authentic:"
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
  return /happy birthday|hbd|happy belated birthday/.test(text.toLowerCase())
}

const getRandomValue = (array: string[]) => {
  return array[Math.floor(Math.random() * array.length)]
}

export default async (body: SlackMessage, faunaClient: Client) => {
  try {
    const plussesFor = parseUsers(body.text)
    const isBirthdayMessage = parseBirthdayMessage(body.text)

    const messages = await Promise.all(
      plussesFor.map(async (user: { username: string; id: string }) => {
        // /**
        //  * First - check if the user exists
        //  **/
        // const findQuery = fql`plusses.firstWhere(.user_id == ${user.id} && .company == companies.firstWhere(.data.id == ${body.team_id}))`
        // const response: QuerySuccess<User> = await faunaClient.query(findQuery)
        // const userDoc = response.data
        // /**
        //  * If the user exists - increase the number of plusses.
        //  * If the user does NOT exist - create the user and give them a plus.
        //  **/
        // let updateQuery
        // if (userDoc) {
        //   updateQuery = fql`${findQuery}!.update({ plusses: ${userDoc.plusses} + 1})`
        // } else {
        //   updateQuery = fql`plusses.create({
        //     username: ${user.username},
        //     user_id: ${user.id},
        //     plusses: 1,
        //     company: companies.firstWhere(.data.id == ${body.team_id})
        //   })`
        // }
        // await faunaClient.query(updateQuery)

        /**
         * Generate a celebrate message based on provided core value emojis, standard or birthday
         * messaging, and provided celebrate emojis.
         **/
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
    return new Response(JSON.stringify(error), { status: 500 })
    // const faunaError = getFaunaError(error)
    // console.log("An error occurred:", faunaError)
    // return new Response(JSON.stringify(faunaError), {
    // status: faunaError.status
    // })
  }
}
