import { NextRequest, NextResponse } from 'next/server'

const VALID_LOCALES = ['es', 'en', 'pt'] as const
type Locale = (typeof VALID_LOCALES)[number]
const DEFAULT_LOCALE: Locale = 'es'

const LANG_MAP: Record<string, Locale> = {
  es: 'es', en: 'en', pt: 'pt',
  'es-419': 'es', 'es-co': 'es', 'es-mx': 'es', 'es-ar': 'es', 'es-ve': 'es',
  'pt-br': 'pt', 'pt-pt': 'pt', 'en-us': 'en', 'en-gb': 'en',
}

function detectLocale(request: NextRequest): Locale {
  const cookieLocale = request.cookies.get('locale')?.value
  if (cookieLocale && VALID_LOCALES.includes(cookieLocale as Locale)) {
    return cookieLocale as Locale
  }
  const acceptLang = request.headers.get('accept-language')
  if (acceptLang) {
    const langs = acceptLang
      .split(',')
      .map((l) => {
        const [lang, q] = l.trim().split(';q=')
        return { lang: lang.trim().toLowerCase(), q: q ? parseFloat(q) : 1.0 }
      })
      .sort((a, b) => b.q - a.q)
    for (const { lang } of langs) {
      if (LANG_MAP[lang]) return LANG_MAP[lang]
      const prefix = lang.split('-')[0]
      if (LANG_MAP[prefix]) return LANG_MAP[prefix]
    }
  }
  return DEFAULT_LOCALE
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }
  const response = NextResponse.next()
  const detectedLocale = detectLocale(request)
  if (!request.cookies.get('locale')) {
    response.cookies.set('locale', detectedLocale, {
      path: '/',
      maxAge: 60 * 60 * 24 * 365,
      sameSite: 'lax',
    })
  }
  response.headers.set('x-locale', detectedLocale)
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
