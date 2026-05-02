import { NextResponse } from 'next/server'
import type { NextProxy } from 'next/server'

const locales = ['en', 'zh']
const defaultLocale = 'en'

const proxy: NextProxy = (request) => {
  const { pathname } = request.nextUrl

  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  )
  if (pathnameHasLocale) return NextResponse.next()

  const acceptLanguage = request.headers.get('accept-language') ?? ''
  const locale = acceptLanguage.toLowerCase().includes('zh') ? 'zh' : defaultLocale

  request.nextUrl.pathname = `/${locale}${pathname}`
  return NextResponse.redirect(request.nextUrl)
}

export default proxy

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)']
}
