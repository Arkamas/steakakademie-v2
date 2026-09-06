import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { adminPasswortGesetzt } from '@/lib/admin-auth'

export async function POST(req: Request) {
  const { password } = await req.json()

  // Ohne gesetztes ADMIN_PASSWORD gibt es keinen Admin — vorher haette ein
  // leerer Body (password === undefined) bei fehlender Variable den Cookie gesetzt.
  if (!adminPasswortGesetzt()) {
    return NextResponse.json({ error: 'Admin nicht konfiguriert' }, { status: 503 })
  }

  if (typeof password === 'string' && password.length > 0 && password === process.env.ADMIN_PASSWORD) {
    const cookieStore = cookies()
    cookieStore.set('admin_auth', password, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    })
    return NextResponse.json({ ok: true })
  }

  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
}
