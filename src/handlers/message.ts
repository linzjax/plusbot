export default async (req: Request) => {
  handleRequest(req)
  // try {
  //   console.log('listen, we are trying our best here')
  //   const body = await req.body

  //   console.log('made it here')

  //   return new Response(
  //     body.challenge,
  //     { status: 200, headers: { 'Content-type': 'text/plain' }}
  //   )

  // } catch(err) {
  //   console.log('error')
  //   console.log(err)
  //   const errorText =
  //     'Uh-oh! We couldn’t find the issue you provided. We can only find public issues in the following format: `owner/repo#issue_number`.';
  //   return new Response(errorText);
  // }
}


async function readRequestBody(request: Request) {
  const { headers } = request;
  const contentType = headers.get('content-type') || '';

  if (contentType.includes('application/json')) {
    return JSON.stringify(await request.json());
  } else if (contentType.includes('application/text')) {
    return request.text();
  } else if (contentType.includes('text/html')) {
    return request.text();
  // } else if (contentType.includes('form')) {
  //   const formData = await request.formData();
  //   const body = {};
  //   for (const entry of formData.entries()) {
  //     body[entry[0]] = entry[1];
  //   }
  //   return JSON.stringify(body);
  } else {
    // Perhaps some other type of data was submitted in the form
    // like an image, or some other binary data.
    return 'a file';
  }
}

async function handleRequest(request: Request) {
  const reqBody = await readRequestBody(request);
  const retBody = `The request body sent in was ${reqBody}`;
  return new Response(retBody);
}
