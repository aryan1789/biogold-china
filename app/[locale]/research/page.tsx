import { notFound } from 'next/navigation'
import Link from 'next/link'
import { getDictionary, hasLocale, type Locale } from '@/lib/dictionaries'

export default async function ResearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()

  const dict = await getDictionary(locale as Locale)
  const d = dict as any

  return (
    <div className="bg-white">

      {/* ── HERO ── */}
      <section className="bg-[#2F2E2D] pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="label-pill-dark mb-6">{d.research.market_label}</div>
            <h1 className="display-lg text-white mb-6">{d.research.headline}</h1>
            <p className="text-white/50 text-lg leading-relaxed max-w-xl mb-8">{d.research.subheadline}</p>
            <a
              href={`/api/competitor-analysis-pdf?locale=${locale}`}
              download={locale === 'zh' ? 'Bio-Gold-中国松花粉市场竞争分析.pdf' : 'Bio-Gold-China-Competitive-Analysis.pdf'}
              className="inline-flex items-center gap-2 border border-white/20 text-white/70 hover:text-white hover:border-white/50 text-sm font-semibold px-5 py-2.5 rounded-full transition-all duration-200"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              {locale === 'zh' ? '下载完整竞争分析报告' : 'Download Full Competitive Analysis'}
            </a>
          </div>
        </div>
      </section>

      {/* ── MARKET STATS ── */}
      <section className="bg-[#D9A91B] py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {d.research.market_stats.map((s: {value: string; label: string}, i: number) => (
              <div key={i}>
                <p className="font-extrabold text-3xl text-[#2F2E2D] mb-1">{s.value}</p>
                <p className="text-[#2F2E2D]/70 text-sm leading-snug">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── WHERE BIO GOLD WINS ── */}
      <section className="py-24 md:py-32 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-xl mb-16">
            <div className="divider-gold" />
            <h2 className="display-md text-[#2F2E2D]">{d.research.gaps_label}</h2>
            <p className="text-[#5A5856] mt-4 leading-relaxed">{d.research.gaps_sub}</p>
          </div>
          <div className="space-y-px bg-[#E4D8C3] rounded-2xl overflow-hidden">
            {d.research.gaps.map((gap: {number: string; title: string; body: string; advantage: string}) => (
              <div key={gap.number} className="bg-[#F5F0E8] hover:bg-white transition-colors duration-200 p-8 md:p-10">
                <div className="grid md:grid-cols-12 gap-6 items-start">
                  <div className="md:col-span-1">
                    <span className="text-[#D9A91B] font-extrabold text-3xl opacity-50">{gap.number}</span>
                  </div>
                  <div className="md:col-span-5">
                    <h3 className="font-bold text-[#2F2E2D] text-xl mb-3">{gap.title}</h3>
                    <p className="text-[#5A5856] text-sm leading-relaxed">{gap.body}</p>
                  </div>
                  <div className="md:col-span-6 md:pl-8">
                    <div className="inline-flex items-center gap-2 bg-[#D9A91B]/15 border border-[#D9A91B]/30 rounded-full px-4 py-2">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#D9A91B]" />
                      <span className="text-[#2F2E2D] font-bold text-xs">{gap.advantage}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── POSITIONING ANGLES ── */}
      <section className="py-24 bg-[#2F2E2D]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-xl mb-16">
            <div className="divider-gold" />
            <h2 className="display-md text-white">{d.research.angles_label}</h2>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {d.research.angles.map((a: {angle: string; body: string}, i: number) => (
              <div key={i} className="bg-[#3D3C3A] rounded-2xl p-8">
                <p className="text-[#D9A91B] font-bold text-lg mb-4 leading-snug">{a.angle}</p>
                <p className="text-white/60 text-sm leading-relaxed">{a.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── DISTRIBUTION ── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-xl mb-16">
            <div className="divider-gold" />
            <h2 className="display-md text-[#2F2E2D]">{d.research.distribution_label}</h2>
            <p className="text-[#5A5856] mt-4 text-sm leading-relaxed">{d.research.distribution_sub}</p>
          </div>
          <div className="grid md:grid-cols-2 gap-4">
            {d.research.distribution.map((item: {platform: string; type: string; note?: string; body?: string}, i: number) => (
              <div key={i} className="border border-[#E4D8C3] rounded-xl p-7 hover:border-[#D9A91B]/30 transition-colors duration-200">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <h3 className="font-bold text-[#2F2E2D] text-lg">{item.platform}</h3>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#D9A91B] bg-[#D9A91B]/10 px-2.5 py-1 rounded-full flex-shrink-0">{item.type}</span>
                </div>
                <p className="text-[#5A5856] text-sm leading-relaxed">{item.note || item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BOTTOM CTA ── */}
      <section className="bg-[#F5F0E8] py-20 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h3 className="display-sm text-[#2F2E2D] mb-4">{d.research.bottom_cta_headline}</h3>
          <p className="text-[#5A5856] mb-8 text-sm leading-relaxed">{d.research.bottom_cta_body}</p>
          <Link href={`/${locale}/b2b`} className="inline-block bg-[#D9A91B] text-[#2F2E2D] font-bold text-sm uppercase tracking-wider px-10 py-4 rounded-full hover:bg-[#F0C84A] transition-colors duration-200">
            {d.research.bottom_cta} →
          </Link>
          <div className="mt-8 space-y-1">
            <p className="text-xs text-[#5A5856]/80">{d.home.compliance.label1}</p>
            <p className="text-xs text-[#5A5856]/80">{d.home.compliance.label2}</p>
          </div>
        </div>
      </section>

    </div>
  )
}
