import SlackREST from "@sagi.io/workers-slack"
import { Router, listen } from "worktop"
import faunadb from "faunadb"

import plusses from "./handlers/plusses"
import authorize from "./handlers/authorize"
import addToSlack from "./handlers/addToSlack"

const router = new Router()
const botAccessToken = SLACK_BOT_ACCESS_TOKEN
const SlackAPI = new SlackREST({ botAccessToken })

const faunaClient = new faunadb.Client({
  // @ts-ignore
  secret: FAUNADB_SECRET as string,
  domain: "db.fauna.com"
})

router.add("POST", "/plusses", plusses(SlackAPI, faunaClient))

// new OAuth redirect url
router.add("GET", "/authorize", authorize)

listen(router.run)
