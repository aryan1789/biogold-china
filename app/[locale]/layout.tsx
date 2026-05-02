import { notFound } from 'next/navigation'
import { getDictionary, hasLocale, type Locale } from '@/lib/dictionaries'
import Navigation from '@/app/components/Navigation'
import Footer from '@/app/components/Footer'

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'zh' }]
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()

  const dict = await getDictionary(locale as Locale)

  return (
    <>
      <Navigation dict={dict} locale={locale as Locale} />
      <main className="flex-1">{children}</main>
      <Footer dict={dict} locale={locale as Locale} />
    </>
  )
}
