import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code  = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  console.log('Callback received:', { code: !!code, state, error });

  if (error) {
    console.error('OAuth error:', error);
    return NextResponse.json({ error: `OAuth error: ${error}` }, { status: 400 });
  }

  const store = await cookies();
  if (state !== store.get('state')?.value) {
    console.error('State mismatch:', { received: state, stored: store.get('state')?.value });
    return NextResponse.json({ error: 'Bad state' }, { status: 400 });
  }

  const codeVerifier = store.get('verifier')?.value;
  if (!codeVerifier) {
    return NextResponse.json({ error: 'No verifier found' }, { status: 400 });
  }

  // Prepare x-www-form-urlencoded body
  const body = new URLSearchParams({
    grant_type: 'authorization_code',
    client_id: process.env.X_CLIENT_ID!,
    redirect_uri: process.env.X_REDIRECT_URI!,
    code: code!,
    code_verifier: codeVerifier,
  });

  const basic = Buffer
      .from(`${process.env.X_CLIENT_ID}:${process.env.X_CLIENT_SECRET}`)
      .toString('base64');

  const r = await fetch('https://api.x.com/2/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Authorization: `Basic ${basic}`,   // confidential client
    },
    body,
  });

  const tokens = await r.json();   // { access_token, refresh_token, expires_in … }

  // Store in a signed cookie or your DB; here we use a cookie for brevity
  const res = NextResponse.redirect(new URL('/dashboard', req.url));
  res.cookies.set('access', tokens.access_token, {
    httpOnly: true, secure: true, sameSite: 'lax',
    maxAge: tokens.expires_in,    // seconds
  });
  if (tokens.refresh_token) {
    res.cookies.set('refresh', tokens.refresh_token, {
      httpOnly: true, secure: true, sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30 * 6,    // 6 months
    });
  }
  return res;
}
