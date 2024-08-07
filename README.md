# Plus Bot

Plus Bot is a slack bot that allows you to give kudos and sparkles to folks. No real world value, just good vibes ✨

<img width="396" alt="Showing plusbot: /++ great job on that presentation @ljacks! PlusBot: Rock on @ljacks!" src="https://github.com/linzjax/plusbot/assets/8128188/bd2da145-2684-4876-844c-ff23ac308ae8">

<img width="422" alt="/++ @ljacks @linzjax Amazing work team! PlusBot: High five @ljacks! Keep it up @linzjax!" src="https://github.com/linzjax/plusbot/assets/8128188/e030c53c-605b-4c75-b505-8dd413b80c3f">

## Usage

Use the `/++` command to indicate that this is a plusbot command. After that tag as many users as you'd like and let others know what a good job they did! Then let the sparkles flow.

```
/++ @user hey good job!
// plusbot will respond with a good job message

/++ Happy birthday @user!
// plusbot will respond with a happy birthday message.
```

## Current State

Currently you can clone this repo, update the emoji's and personal messages to whatever best fits your organization. From there you can deploy it to a Cloudflare worker, and set up your own custom Slackbot.

### Initial Setup

1. Clone the repo

#### Cloudflare

Create two new cloudflare workers

1. plusbot
1. plusbot-dev (If you're doing active development, I'd suggest creating a separate slack where you can test out features.)

#### Create a new Slack app

1. Go to permissions and install in your workspace
2. Add a new redirect url that matches the cloudflare worker:
   ```
   https://plusbot.[your-user-name].workers.dev/authorize
   ```
3. Give it bot token scopes [chat:write, commands]
4. Go to Slash Commands and add `/++` as a new command.
5. Give it a fun picture and description if you want!

#### Cloudflare variables

1. Go back into your cloudflare workers and add the variables found in [env.example](./env.example).

> Note: All of the values in ### CUSTOMIZATIONS #### can be changed to whatever makes sense for you and your organization! Pick emojis that your company uses frequently, use kudos messages that makes sense for your vibe, go wild.

2. There's information in env.example for where to find the Slack variables that are needed.

> Note: All the slack variables should be Encrypted in cloudflare.

## To push changes to Cloudflare

```
# for your dev environment:
npm run deploy-dev

# for deploying to prod:
npm run deploy
```

## Internal notes.

You can read if you want, but these were mostly for me :)

### Body for a slack request

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

### TODOs:

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
- Itty-router only parses requests that come in with application/json. Slack sends application/x-www-form-urlencoded
