import { Router, listen } from "worktop"
import faunadb from "faunadb"

import plusses from "./handlers/plusses"

const router = new Router()

const faunaClient = new faunadb.Client({
  // @ts-ignore
  secret: FAUNADB_SECRET as string,
  domain: "db.fauna.com"
})

router.add("POST", "/plusses", plusses(faunaClient))

listen(router.run)
