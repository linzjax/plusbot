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

    const messages = await Promise.all(
      plussesFor.map(async (user: { username: string; id: string }) => {
        // Check if the user_id exists at all
        // If it does, increase the number of plusses by 1
        // If it does not, create a record for the user
        const combinedQuery = fql`
          let lookupQuery = .user_id == ${user.id} && .company == companies.firstWhere(.data.id == ${body.team_id})
          if (plusses.firstWhere(lookupQuery).exists()) {
            let user = plusses.firstWhere(lookupQuery)
            plusses.firstWhere(lookupQuery)!.update({ "plusses": user.data.plusses + 1 })
          } else {
            plusses.create({
              username: ${user.username},
              user_id: ${user.id},
              plusses: 1,
              company: companies.firstWhere(.data.id == ${body.team_id})
            })
          }
        `

        // const findQuery = fql`plusses.firstWhere(.user_id == ${user.id} && .company == companies.firstWhere(.data.id == ${body.team_id}))`
        // const response: QuerySuccess<User> = await faunaClient.query(findQuery)
        // const userDoc = response.data
        // /**
        //  * TODO: Check if user exists. If not create it
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

        const result = await faunaClient.query(combinedQuery)
        console.log(JSON.stringify(result.data))

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
