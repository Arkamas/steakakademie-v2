import { type NextRequest, NextResponse } from 'next/server';
import { updateSession }   from '@/lib/supabase/middleware';

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

  return (await updateSession(request)).response;
}

export const config = {
  matcher: [
    /*
     * Alle Routen matchen außer:
     * - _next/static (statische Dateien)
     * - _next/image  (Bild-Optimierung)
     * - favicon.ico
     * - öffentliche Bild-Endungen
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
