import { SlackMessage } from "../types"

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
  }
}
