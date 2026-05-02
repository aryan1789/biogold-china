import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { getDictionary, hasLocale, type Locale } from '@/lib/dictionaries'
import { getAllProducts, getLocalizedContent } from '@/lib/products'

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  if (!hasLocale(locale)) notFound()

  const dict = await getDictionary(locale as Locale)
  const products = await getAllProducts()
  const d = dict as any

  return (
    <div className="bg-white">

      {/* ── HERO ── */}
      <section className="relative min-h-screen bg-[#2F2E2D] flex flex-col justify-end overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/products/hero-forest.jpg" alt="New Zealand Pine Forest" fill className="object-cover opacity-35" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-[#2F2E2D] via-[#2F2E2D]/60 to-[#2F2E2D]/10" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 pb-20 pt-40">
          <div className="max-w-4xl">
            <div className="label-pill-dark mb-8">{d.home.hero.badge}</div>
            <h1 className="display-xl text-white mb-8">
              {d.home.hero.headline}
            </h1>
            <p className="text-white/60 text-lg md:text-xl max-w-xl leading-relaxed mb-10 font-medium">
              {d.home.hero.subheadline}
            </p>
            <div className="flex flex-wrap items-center gap-6 mb-12">
              {d.home.hero.trust.map((t: {value: string; label: string}, i: number) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-[#D9A91B] font-extrabold text-lg">{t.value}</span>
                  <span className="text-white/40 text-sm">{t.label}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-4">
              <Link href={`/${locale}/products/pine-pollen-tablets`} className="bg-[#D9A91B] text-[#2F2E2D] font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-full hover:bg-[#F0C84A] transition-colors duration-200">
                {d.home.hero.cta_primary}
              </Link>
              <Link href={`/${locale}/b2b`} className="border border-white/20 text-white font-bold text-sm uppercase tracking-wider px-8 py-4 rounded-full hover:border-white/50 hover:bg-white/5 transition-all duration-200">
                {d.home.hero.cta_secondary}
              </Link>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </section>

      {/* ── PROVENANCE ── */}
      <section className="max-w-7xl mx-auto px-6 py-24 md:py-32">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="divider-gold" />
            <h2 className="display-md text-[#2F2E2D] mb-6">{d.home.provenance.headline}</h2>
            <p className="text-[#5A5856] text-lg leading-relaxed">{d.home.provenance.body}</p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {d.home.provenance.stats.map((stat: {value: string; label: string}, i: number) => (
              <div key={i} className="stat-card">
                <p className="text-[#D9A91B] font-extrabold text-3xl mb-1">{stat.value}</p>
                <p className="text-[#2F2E2D] font-semibold text-sm leading-snug">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MECHANISM ── */}
      <section className="bg-[#2F2E2D] py-24 md:py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <div className="label-pill-dark mb-6 mx-auto inline-block">{d.home.mechanism.label}</div>
            <h2 className="display-md text-white mb-6">{d.home.mechanism.headline}</h2>
            <p className="text-white/50 text-lg leading-relaxed">{d.home.mechanism.subheadline}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-white/5 rounded-2xl overflow-hidden">
            {d.home.mechanism.steps.map((s: {step: string; title: string; body: string}) => (
              <div key={s.step} className="bg-[#3D3C3A] p-10">
                <p className="text-[#D9A91B] font-extrabold text-4xl mb-6 opacity-40">{s.step}</p>
                <h3 className="text-white font-bold text-xl mb-4">{s.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{s.body}</p>
              </div>
            ))}
          </div>
          <p className="text-white/20 text-xs text-center mt-6">{d.home.mechanism.footnote}</p>
        </div>
      </section>

      {/* ── PRODUCTS ── */}
      <section className="py-24 md:py-32 bg-[#F5F0E8]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
            <div>
              <div className="divider-gold" />
              <h2 className="display-md text-[#2F2E2D]">{d.home.products_section.headline}</h2>
            </div>
            <p className="text-[#5A5856] max-w-xs text-sm leading-relaxed">{d.home.products_section.subheadline}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {products.map((product) => {
              const content = getLocalizedContent(product, locale as Locale)
              const imgMap: Record<string, string> = {
                'pine-pollen-face-mask': '/images/products/pine-pollen-face-mask.jpg',
                'pine-pollen-tablets': '/images/products/pine-pollen-tablets.jpg',
                'body-cream': '/images/products/body-cream.jpg',
              }
              return (
                <Link key={product.slug} href={`/${locale}/products/${product.slug}`} className="group bg-white rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                  <div className="relative h-72 overflow-hidden">
                    <Image src={imgMap[product.slug]} alt={content.name} fill className="object-cover group-hover:scale-105 transition-transform duration-700" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute bottom-4 left-4">
                      <span className="label-pill">{product.category}</span>
                    </div>
                  </div>
                  <div className="p-7">
                    <h3 className="font-extrabold text-xl text-[#2F2E2D] mb-2 group-hover:text-[#D9A91B] transition-colors duration-200">{content.name}</h3>
                    <p className="text-[#5A5856] text-sm leading-relaxed mb-4">{content.tagline}</p>
                    <div className="flex flex-wrap gap-2">
                      {content.claims.slice(0, 2).map((claim, ci) => (
                        <span key={ci} className="text-xs text-[#D9A91B] bg-[#D9A91B]/10 px-3 py-1 rounded-full font-medium">{claim}</span>
                      ))}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── INGREDIENT STORY ── */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0">
          <Image src="/images/products/pollen-close.jpg" alt="Pine Pollen" fill className="object-cover" />
          <div className="absolute inset-0 bg-[#2F2E2D]/85" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-2xl">
            <div className="label-pill-dark mb-6">{d.home.provenance_section.label}</div>
            <h2 className="display-md text-white mb-6">{d.home.provenance_section.headline}</h2>
            <p className="text-white/60 text-lg leading-relaxed mb-8">{d.home.provenance_section.body}</p>
            <div className="flex flex-wrap gap-8">
              {d.home.provenance_section.stats.map((s: {label: string; value: string}, i: number) => (
                <div key={i}>
                  <p className="text-[#D9A91B] font-bold text-sm">{s.value}</p>
                  <p className="text-white/40 text-xs mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── MARKET OPPORTUNITY ── */}
      <section className="py-24 md:py-32 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="bg-[#F5F0E8] rounded-2xl p-10">
              <p className="text-xs font-bold uppercase tracking-widest text-[#D9A91B] mb-6">{d.home.market_section.label}</p>
              {d.home.market_section.stats.map((s: {value: string; label: string}, i: number) => (
                <div key={i} className="flex items-start gap-5 py-5 border-b border-[#E4D8C3] last:border-0">
                  <span className="text-[#D9A91B] font-extrabold text-2xl flex-shrink-0 w-20">{s.value}</span>
                  <p className="text-[#5A5856] text-sm leading-snug pt-1">{s.label}</p>
                </div>
              ))}
            </div>
            <div>
              <div className="divider-gold" />
              <h2 className="display-md text-[#2F2E2D] mb-6">{d.home.research_section.headline}</h2>
              <p className="text-[#5A5856] leading-relaxed mb-8">{d.home.research_section.body}</p>
              <Link href={`/${locale}/research`} className="inline-flex items-center gap-2 font-bold text-sm uppercase tracking-wider text-[#2F2E2D] border border-[#2F2E2D] px-8 py-4 rounded-full hover:bg-[#2F2E2D] hover:text-white transition-all duration-200">
                {d.home.research_section.cta}
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── B2B CTA ── */}
      <section className="bg-[#D9A91B] py-24 md:py-28">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="display-lg text-[#2F2E2D] mb-4">{d.home.b2b_section.headline}</h2>
            <p className="text-[#2F2E2D]/70 text-lg leading-relaxed mb-10">{d.home.b2b_section.body}</p>
            <Link href={`/${locale}/b2b`} className="inline-block bg-[#2F2E2D] text-white font-bold text-sm uppercase tracking-wider px-10 py-5 rounded-full hover:bg-[#1A1918] transition-colors duration-200">
              {d.home.b2b_section.cta} →
            </Link>
            <div className="mt-8 space-y-1">
              <p className="text-xs text-[#2F2E2D]/75">{d.home.compliance.label1}</p>
              <p className="text-xs text-[#2F2E2D]/75">{d.home.compliance.label2}</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
