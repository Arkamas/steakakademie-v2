import { type NextRequest } from 'next/server';
import { updateSession }    from '@/lib/supabase/middleware';

// Routen die ein eingeloggtes Konto erfordern
const PROTECTED = ['/profil', '/meine-kurse'];

export async function middleware(request: NextRequest) {
  const { response, user } = await updateSession(request);

  const isProtected = PROTECTED.some(p =>
    request.nextUrl.pathname.startsWith(p),
  );

  if (isProtected && !user) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.searchParams.set('redirectTo', request.nextUrl.pathname);
    return Response.redirect(loginUrl);
  }

  return response;
}

export const config = {
  matcher: [
    // Alle Routen außer statische Assets und Next.js-Internals
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
