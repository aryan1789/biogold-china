import { notFound } from 'next/navigation'
import { getDictionary, hasLocale, type Locale } from '@/lib/dictionaries'
import B2BGenerator from '@/app/components/B2BGenerator'

export default async function B2BPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()

  const dict = await getDictionary(locale as Locale)
  const d = dict as any

  return (
    <div className="bg-white">

      {/* ── HERO ── matches Research and Product page pattern ── */}
      <section className="bg-[#2F2E2D] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="label-pill-dark mb-6">{d.b2b_label}</div>
            <h1 className="display-lg text-white mb-6">{dict.b2b.headline}</h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-xl">{dict.b2b.subheadline}</p>
          </div>
        </div>
      </section>

      {/* ── FORM + SIDEBAR ── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-5 gap-12">
          <div className="md:col-span-3">
            <B2BGenerator dict={dict.b2b} locale={locale} />
            <div className="mt-5 space-y-1">
              <p className="text-xs text-[#5A5856]/50">{d.home.compliance.label1}</p>
              <p className="text-xs text-[#5A5856]/50">{d.home.compliance.label2}</p>
            </div>
          </div>
          <div className="md:col-span-2">
            <div className="bg-[#F5F0E8] rounded-2xl p-8 sticky top-28">
              <h3 className="font-bold text-[#2F2E2D] mb-6">{dict.b2b.what_you_get.heading}</h3>
              <ul className="space-y-4">
                {dict.b2b.what_you_get.items.map((item: string, i: number) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-full bg-[#D9A91B]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <div className="w-2 h-2 rounded-full bg-[#D9A91B]" />
                    </div>
                    <span className="text-sm text-[#5A5856]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
