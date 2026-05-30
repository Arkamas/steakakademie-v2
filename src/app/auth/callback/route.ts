import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code       = searchParams.get('code');
  const tokenHash  = searchParams.get('token_hash');
  const type       = searchParams.get('type');
  const redirectTo = searchParams.get('next') ?? '/profil';

  const supabase = createClient();

  // 1) Magic-Link / E-Mail-OTP (admin generateLink → token_hash)
  if (tokenHash && type) {
    const { error } = await supabase.auth.verifyOtp({ type: type as any, token_hash: tokenHash });
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  // 2) PKCE-Code (OAuth / signInWithOtp vom Login-Formular)
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirectTo}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/login?error=auth_code_error`);
}
