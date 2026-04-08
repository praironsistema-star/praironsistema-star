import { NextRequest, NextResponse } from 'next/server'

const VALID_LOCALES = ['es', 'en', 'pt'] as const
type Locale = (typeof VALID_LOCALES)[number]
const DEFAULT_LOCALE: Locale = 'es'
const LANG_MAP: Record<string, Locale> = {
  es: 'es', en: 'en', pt: 'pt',
  'es-419': 'es', 'es-co': 'es', 'es-mx': 'es', 'es-ar': 'es', 'es-ve': 'es',
  'pt-br': 'pt', 'pt-pt': 'pt', 'en-us': 'en', 'en-gb': 'en',
}

const PUBLIC_PATHS = ['/login', '/register', '/forgot-password', '/reset-password', '/onboarding', '/demo']

function detectLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get('locale')?.value
  if (cookieLocale && VALID_LOCALES.includes(cookieLocale as Locale)) return cookieLocale as Locale
  const acceptLang = request.headers.get('accept-language')
  if (acceptLang) {
    const langs = acceptLang.split(',')
      .map((l) => { const [lang, q] = l.trim().split(';q='); return { lang: lang.trim().toLowerCase(), q: q ? parseFloat(q) : 1.0 } })
      .sort((a, b) => b.q - a.q)
    for (const { lang } of langs) {
      if (LANG_MAP[lang]) return LANG_MAP[lang]
      const prefix = lang.split('-')[0]
      if (LANG_MAP[prefix]) return LANG_MAP[prefix]
    }
  }
  return DEFAULT_LOCALE
}

function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64 = token.split('.')[1]
    const decoded = Buffer.from(base64, 'base64url').toString('utf-8')
    return JSON.parse(decoded)
  } catch { return null }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Ignorar assets y API
  if (pathname.startsWith('/_next') || pathname.startsWith('/api') || pathname.startsWith('/favicon') || pathname.includes('.')) {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  // ── Locale ──────────────────────────────────────────────────────────────────
  const detectedLocale = detectLocale(request)
  if (!request.cookies.get('locale')) {
    response.cookies.set('locale', detectedLocale, { path: '/', maxAge: 60 * 60 * 24 * 365, sameSite: 'lax' })
  }
  response.headers.set('x-locale', detectedLocale)

  // ── Onboarding guard ────────────────────────────────────────────────────────
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))
  if (isPublic) return response

  const token = request.cookies.get('token')?.value || request.cookies.get('access_token')?.value
  if (!token) {
    // No hay sesión → redirigir a login
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('from', pathname)
    return NextResponse.redirect(loginUrl)
  }

  const payload = parseJwtPayload(token)
  if (payload && payload.isOnboarded === false) {
    // Tiene sesión pero no completó onboarding
    return NextResponse.redirect(new URL('/onboarding', request.url))
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
