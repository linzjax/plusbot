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

/***
 * Check if the message is a birthday message
 **/
const parseBirthdayMessage = (text: string) => {
  return /happy birthday|hbd|happy bday|happy belated birthday|happy belated bday/.test(
    text.toLowerCase()
  )
}

const getRandomValue = (array: string[]) => {
  return array[Math.floor(Math.random() * array.length)]
}

export default async (
  body: SlackMessage,
  frontEmojis: string[],
  backEmojis: string[],
  kudosMessages: string[],
  bdayMessages: string[]
) => {
  try {
    const plussesFor = parseUsers(body.text)
    const isBirthdayMessage = parseBirthdayMessage(body.text)

    const messages = await Promise.all(
      plussesFor.map(async (user: { username: string; id: string }) => {
        /**
         * Generate a celebratory message based on provided front emojis, kudos or birthday
         * messaging, and provided back emojis.
         **/
        return `:sparkles:${getRandomValue(frontEmojis)}:sparkles:   ${
          isBirthdayMessage
            ? getRandomValue(bdayMessages)
            : getRandomValue(kudosMessages)
        } @${user.username}!    :sparkles:${getRandomValue(
          backEmojis
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
