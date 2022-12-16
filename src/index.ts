import { Router, listen } from "worktop"
import faunadb from "faunadb"
import { InstallProvider } from "@slack/oauth"

import plusses from "./handlers/plusses"
import authorize from "./handlers/authorize"
import addToSlack from "./handlers/addToSlack"

const router = new Router()

const faunaClient = new faunadb.Client({
  // @ts-ignore
  secret: FAUNADB_SECRET as string,
  domain: "db.fauna.com"
})

// initialize the installProvider
const installer = new InstallProvider({
  clientId: process.env.SLACK_CLIENT_ID as string,
  clientSecret: process.env.SLACK_CLIENT_SECRET as string,
  stateSecret: "my-state-secret"
})

router.add("POST", "/plusses", plusses(faunaClient))

// new OAuth redirect url
router.add("GET", "/authorize", authorize)

router.add("GET", "/", addToSlack)

listen(router.run)
