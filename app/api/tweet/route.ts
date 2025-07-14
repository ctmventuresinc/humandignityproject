import { cookies } from 'next/headers';

export async function POST(req: Request) {
  const { text } = await req.json();
  const access = (await cookies()).get('access')?.value;
  
  if (!access) {
    return new Response('Unauthorized', { status: 401 });
  }

  const r = await fetch('https://api.x.com/2/tweets', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${access}`,
    },
    body: JSON.stringify({ text }),
  });

  if (!r.ok) {
    const error = await r.text();
    return new Response(error, { status: r.status });
  }

  const result = await r.json();
  return new Response(JSON.stringify(result), { 
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}
