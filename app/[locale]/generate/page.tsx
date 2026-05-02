import { notFound } from 'next/navigation'
import { getDictionary, hasLocale, type Locale } from '@/lib/dictionaries'
import ProductGenerator from '@/app/components/ProductGenerator'

export default async function GeneratePage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()

  const dict = await getDictionary(locale as Locale)
  const d = dict as any

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <span className="text-xs font-semibold uppercase tracking-widest text-gold">{d.generate_label}</span>
        <h1 className="text-4xl font-bold text-charcoal mt-3 mb-4">{dict.generate.headline}</h1>
        <p className="text-charcoal/60 max-w-2xl mx-auto leading-relaxed">{dict.generate.subheadline}</p>
      </div>
      <ProductGenerator dict={dict.generate} locale={locale} />
    </div>
  )
}
