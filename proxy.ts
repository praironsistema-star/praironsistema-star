import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const SUPPORTED = ['es', 'en', 'pt'];

export function proxy(request: NextRequest) {
  const response = NextResponse.next();
  
  // Si ya tiene cookie de idioma, respetarla
  const cookieLocale = request.cookies.get('locale')?.value;
  if (cookieLocale && SUPPORTED.includes(cookieLocale)) {
    response.headers.set('x-locale', cookieLocale);
    return response;
  }

  // Detectar desde Accept-Language del navegador
  const acceptLang = request.headers.get('accept-language') || '';
  const browserLang = acceptLang.split(',')[0].split('-')[0].toLowerCase();
  const detected = SUPPORTED.includes(browserLang) ? browserLang : 'es';

  // Guardar en cookie para próximas visitas
  response.cookies.set('locale', detected, { path: '/', maxAge: 31536000 });
  response.headers.set('x-locale', detected);
  
  return response;
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
