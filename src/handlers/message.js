import qs from 'qs'

export default async request => {
  try {
    console.log('listen, we are trying our best here')
    const body = await request.body()
    // const timestamp = request.headers['X-Slack-Request-Timestamp']

    // // make sure time makes sense.
    // // if (absolute_value(time.time() - timestamp) > 60 * 5) {
    // //   return
    // // }


    // const slackSecret = process.env.SLACK_SIGNING_SECRET
    // const sigBasestring = 'v0:' + timestamp + ':' + body
    // const slack_signature = request.headers['X-Slack-Signature']

    // // You will need some super-secret data to use as a symmetric key.
    // const encoder = new TextEncoder();
    // // The slack secret is what's supposed to be the key.
    // const secretKeyData = encoder.encode(sigBasestring);

    // const slackSignature = 'v0=' + crypto.subtle.sign("HMAC", slackSecret, sigBasestring)

    // const blocks = [
    //   {
    //     type: 'section',
    //     text: {
    //       type: 'mrkdwn',
    //       text: ['oh hey whats up..', 'I was just passing through..', 'dont mind me...'].join('\n'),
    //     }
    //   }
    // ]

    // const justTheHash = slack_siganture.slice(3, slack_signature.length)

    console.log('made it here')

    return new Response(
      "oh hello" + body.challenge,
      { status: 200 },
      { headers: { 'Content-type': 'text/plain' }}
    )

  } catch(err) {
    console.log('error')
    console.log(err)
    const errorText =
      'Uh-oh! We couldn’t find the issue you provided. We can only find public issues in the following format: `owner/repo#issue_number`.';
    return new Response(errorText);
  }
}
