export default async (req: Request) => {
  /*
    TODO: Add signature verification
  */

  try {
    const reqBody = await JSON.stringify(await req.json())
    const retBody = `The request body sent in was ${reqBody}`;
    console.log(retBody)
    return new Response(retBody, {status: 200, headers: { 'Content-type': 'text/plain' }});

  } catch(err) {
    console.log(err)
    const errorText =
      'Uh-oh! We couldn’t find the issue you provided. We can only find public issues in the following format: `owner/repo#issue_number`.';
    return new Response(errorText);
  }
}
