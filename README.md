To push changes to Cloudflare

```
wrangler deploy
```

## Body for a slack request

```
{
  token: <token>,
  team_id: <id of the slack team>,
  team_domain: 'lindseysappfactory',
  channel_id: <id of the slack channel>,
  channel_name: 'random',
  user_id: <user id>,
  user_name: 'linzjax',
  command: '/++',
  text: '<@<user_id>|ljacks>',
  api_app_id: <api app id>,
  is_enterprise_install: 'false',
  response_url: <where to post the response to>,
  trigger_id: <trigger id string>
}
```

TODOs:

- [ ] Add companies if they don't exist
- [ ] Print out a help message if there's no user tagged in the message
- [ ] Provide a "list" option
- [ ] Add unit tests
- [ ] Clean up code
- [ ] Set up OAuth
- [ ] Prevent users from giving themselves plusses
- [ ] Rename "companies" "teams" to match slacks lingo

### Breadcrumbs

Things that I've learned along the way:

- @slack/web-api uses axios, which is incompatable with cloudflare workers.
- worktop, though convenient, does not use traditional request objects, so standard operations like `.clone()` are not available, making it incompatable with @sagi.io/workers-slack 's `verifyRequestSignature` function.
