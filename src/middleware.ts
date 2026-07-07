import { type NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin-UI: ungültiges/fehlendes Cookie → zur Login-Seite
  if (pathname.startsWith('/admin')) {
    if (pathname !== '/admin/login') {
      const auth = request.cookies.get('admin_auth');
      if (auth?.value !== process.env.ADMIN_PASSWORD) {
        return NextResponse.redirect(new URL('/admin/login', request.url));
      }
    }
    return NextResponse.next();
  }

  // Geschützte Admin-/Pipeline-APIs (Login-Endpoint ausgenommen) → 401 JSON
  if (
    (pathname.startsWith('/api/admin') && pathname !== '/api/admin/auth') ||
    pathname.startsWith('/api/pm-agent')
  ) {
    const auth = request.cookies.get('admin_auth');
    if (auth?.value !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.next();
  }

  // Login-Gate für Nutzerbereiche (Supabase-Session refreshen + prüfen)
  const { response, user } = await updateSession(request);
  const PROTECTED = ['/meine-kurse', '/profil', '/steuer-matrix/rechner', '/mein-system'];
  if (!user && PROTECTED.some((p) => pathname.startsWith(p))) {
    const loginUrl = new URL('/auth/login', request.url);
    loginUrl.searchParams.set('redirectTo', pathname);
    return NextResponse.redirect(loginUrl);
  }
  return response;
}

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
    '/api/pm-agent/:path*',
    '/meine-kurse/:path*',
    '/profil/:path*',
    '/steuer-matrix/rechner/:path*',
    '/mein-system/:path*',
  ],
};
