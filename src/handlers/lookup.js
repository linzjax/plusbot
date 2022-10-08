import qs from "qs"

export default async (request) => {
  try {
    const body = await request.text()
    const params = qs.parse(body)
    const text = params["text"].trim()

    const blocks = [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: [
            "oh hey whats up..",
            "I was just passing through..",
            "dont mind me..."
          ].join("\n")
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
  } catch (err) {
    const errorText =
      "Uh-oh! We couldn’t find the issue you provided. We can only find public issues in the following format: `owner/repo#issue_number`."
    return new Response(errorText)
  }
}
