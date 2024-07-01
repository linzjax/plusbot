# Plus Bot

Plus Bot is a slack bot that allows you to give kudos and sparkles to folks. No real world value, just good vibes ✨

<img width="396" alt="Showing plusbot: /++ great job on that presentation @ljacks! PlusBot: Rock on @ljacks!" src="https://github.com/linzjax/plusbot/assets/8128188/bd2da145-2684-4876-844c-ff23ac308ae8">

## Current State

Currently you can clone this repo, update the emoji's and personal messages to whatever best fits your organization. From there you can deploy it to a Cloudflare worker, and set up your own custom Slackbot.

## To push changes to Cloudflare

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

## TODOs:

- [ ] Pull out list of emojis so that they are easier to customize
- [ ] Write out setup instructions


- [ ] Add companies if they don't exist
- [ ] Print out a help message if there's no user tagged in the message
- [ ] Provide a "list" option
- [ ] Add unit tests
- [ ] Clean up code
- [ ] Set up OAuth
- [ ] Prevent users from giving themselves plusses
- [ ] Rename "companies" "teams" to match slacks lingo

## Breadcrumbs

Things that I've learned along the way:

- @slack/web-api uses axios, which is incompatable with cloudflare workers.
- worktop, though convenient, does not use traditional request objects, so standard operations like `.clone()` are not available, making it incompatable with @sagi.io/workers-slack 's `verifyRequestSignature` function.
- Itty-router only parses requests that come in with application/json. Slack sends application/x-www-form-urlencoded
