import {Router, listen} from 'worktop';
import faunadb from 'faunadb';
import { getFaunaError, getId, getDataField } from './utils';
import invariant from 'tiny-invariant';



const router = new Router();

const faunaClient = new faunadb.Client({
  // @ts-ignore
  secret: FAUNADB_SECRET as string,
  domain: 'db.fauna.com',
})

const q = faunadb.query;

router.add('POST', '/plusses', async (request, response) => {
  try {
    const body = await request.body();

    invariant(body !== null, 'Body request was empty');

    /*

    {
      "token": "uchynaSVwpCsen11gvc4H7kQ",
      "team_id": "T045JP1N51T",
      "team_domain": "lindseysappfactory",
      "channel_id": "C045JP4PWTX",
      "channel_name": "plusbot",
      "user_id": "U045MMQ3ZDG",
      "user_name": "linzjax",
      "command": "/plusbot",
      "text": "",
      "api_app_id": "A04575DJUDD",
      "is_enterprise_install": "false",
      "response_url": "https://hooks.slack.com/commands/T045JP1N51T/4218244674272/Mj3Q5WeLZOjHE34QSn5Kbw4Q",
      "trigger_id": "4197002111524.4188783753061.cf409fc3a8c3f06a0c44df6f680c5746"
    }
    */

    const result = await faunaClient.query(q.Let({
      user: q.Get(q.Match(q.Index('plusses_by_user_id'), body.user_id))
    },
      q.Update(
        q.Ref(q.Collection("plusses"), getId("user")),
        {
          data: {
            plusses: q.Add(getDataField("user", 'plusses'), 1)
          }
        }
      )
    ))

    const userUpdated: { [plusses: string]: number} = await faunaClient.query(
      q.Let({
        u: q.Get(q.Match(q.Index('plusses_by_user_id'), body.user_id))
    }, {
      plusses: getDataField("u", "plusses")
    }))

    response.send(200, `@${body.user_name} now has ${userUpdated.plusses} plusses!`)

  } catch (error) {
    const faunaError = getFaunaError(error);
    console.log(faunaError)
    response.send(faunaError.status, faunaError);
  }
});

listen(router.run);
