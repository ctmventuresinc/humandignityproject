import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function GET() {
  // 1) PKCE bits
  const codeVerifier  = crypto.randomBytes(64).toString('hex');
  const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

  // 2) state for CSRF
  const state = crypto.randomUUID();

  // 3) Store verifier & state in a secure cookie
  const res = NextResponse.json({});
  res.cookies.set('verifier', codeVerifier, { httpOnly: true, sameSite: 'lax', secure: true, path: '/' });
  res.cookies.set('state', state,       { httpOnly: true, sameSite: 'lax', secure: true, path: '/' });

  // 4) Build X's authorize URL
  const p = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.X_CLIENT_ID!,
    redirect_uri: process.env.X_REDIRECT_URI!,
    scope: 'tweet.read tweet.write users.read offline.access',
    state,
    code_challenge: codeChallenge,
    code_challenge_method: 'S256',
  });

  const url = `https://x.com/i/oauth2/authorize?${p}`;
  return NextResponse.json({ url });
}
