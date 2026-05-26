import { type NextRequest } from 'next/server';
import { updateSession }   from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
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
