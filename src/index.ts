import { Router, listen } from "worktop"
import faunadb from "faunadb"
import { WebClient } from "@slack/web-api"

const client = new WebClient()

import plusses from "./handlers/plusses"
import authorize from "./handlers/authorize"
import addToSlack from "./handlers/addToSlack"

const router = new Router()

const faunaClient = new faunadb.Client({
  // @ts-ignore
  secret: FAUNADB_SECRET as string,
  domain: "db.fauna.com"
})

router.add("POST", "/plusses", plusses(faunaClient))

// new OAuth redirect url
router.add("GET", "/authorize", authorize)

listen(router.run)
