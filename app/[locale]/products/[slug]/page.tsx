import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getDictionary, hasLocale, type Locale } from '@/lib/dictionaries'
import { getProduct, getAllProducts, getLocalizedContent, getLocalizedRegulatory } from '@/lib/products'
import RegulatoryCard from '@/app/components/RegulatoryCard'

const PRODUCT_IMAGES: Record<string, string> = {
  'pine-pollen-face-mask': '/images/products/pine-pollen-face-mask.jpg',
  'pine-pollen-tablets': '/images/products/pine-pollen-tablets.jpg',
  'body-cream': '/images/products/body-cream.jpg',
}

export async function generateStaticParams() {
  const products = await getAllProducts()
  return ['en', 'zh'].flatMap(locale =>
    products.map(product => ({ locale, slug: product.slug }))
  )
}

export default async function ProductPage({ params }: { params: Promise<{ locale: string; slug: string }> }) {
  const { locale, slug } = await params
  if (!hasLocale(locale)) notFound()

  const [dict, product] = await Promise.all([
    getDictionary(locale as Locale),
    getProduct(slug),
  ])
  if (!product) notFound()

  const d = dict as any
  const content = getLocalizedContent(product, locale as Locale)
  const regulatory = getLocalizedRegulatory(product, locale as Locale)
  const productImage = PRODUCT_IMAGES[slug] || '/images/products/pine-pollen-tablets.jpg'

  return (
    <div className="bg-white">

      {/* ── HERO ── */}
      <section className="relative bg-[#2F2E2D] pt-28 pb-0 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-end">
            <div className="pb-16">
              <div className="label-pill-dark mb-6">{product.category}</div>
              <h1 className="display-lg text-white mb-5">{content.name}</h1>
              <p className="text-[#D9A91B] text-xl font-semibold italic mb-6">{content.tagline}</p>
              <p className="text-white/60 text-lg leading-relaxed mb-8 max-w-md">{content.hero.subheadline}</p>
              <div className="flex flex-col gap-1">
                <p className="text-white/60 text-xs">{dict.product.compliance.label1}</p>
                <p className="text-white/60 text-xs">{dict.product.compliance.label2}</p>
              </div>
            </div>

            {/* Product image */}
            <div className="relative h-[480px] rounded-t-2xl overflow-hidden">
              <Image src={productImage} alt={content.name} fill className="object-cover object-center" priority />
              <div className="absolute inset-0 bg-gradient-to-t from-[#2F2E2D]/40 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* ── CLAIMS ── */}
      <section className="bg-[#D9A91B] py-4">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap gap-8 items-center justify-center md:justify-start">
            {content.claims.map(claim => (
              <div key={claim} className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-[#2F2E2D]" />
                <span className="text-[#2F2E2D] font-bold text-sm">{claim}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── BENEFITS ── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="divider-gold" />
        <h2 className="display-sm text-[#2F2E2D] mb-12">{dict.product.benefits_heading}</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {content.benefits.map((benefit, i) => (
            <div key={i} className="flex gap-6 p-8 rounded-2xl bg-[#F5F0E8] hover:bg-[#EDE5D4] transition-colors duration-200">
              <div className="w-10 h-10 rounded-full bg-[#D9A91B]/15 flex items-center justify-center flex-shrink-0 mt-0.5">
                <div className="w-4 h-4 rounded-full bg-[#D9A91B]" />
              </div>
              <div>
                <h3 className="font-bold text-[#2F2E2D] text-lg mb-2">{benefit.title}</h3>
                <p className="text-[#5A5856] text-sm leading-relaxed">{benefit.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── MECHANISM ── */}
      <section className="bg-[#2F2E2D] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid md:grid-cols-5 gap-16 items-center">
            <div className="md:col-span-3">
              <div className="label-pill-dark mb-6">{dict.product.mechanism_heading}</div>
              <p className="text-white/70 text-lg leading-relaxed">{content.mechanism}</p>
            </div>
            <div className="md:col-span-2 grid grid-cols-2 gap-4">
              {content.credibility.map((item, i) => (
                <div key={i} className="stat-card text-center">
                  <p className="text-[#D9A91B] font-extrabold text-3xl mb-2">{item.stat}</p>
                  <p className="text-white/50 text-xs leading-snug">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── INGREDIENT STORY ── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div className="relative h-80 rounded-2xl overflow-hidden bg-[#E4D8C3]">
            <Image src="/images/products/hero-forest.jpg" alt="New Zealand Forest" fill className="object-cover" />
          </div>
          <div>
            <div className="divider-gold" />
            <h2 className="display-sm text-[#2F2E2D] mb-6">{dict.product.ingredient_heading}</h2>
            <p className="text-[#5A5856] leading-relaxed">{content.ingredientStory}</p>
          </div>
        </div>
      </section>

      {/* ── USAGE ── */}
      <section className="bg-[#F5F0E8] py-24">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-2xl mx-auto">
            <div className="divider-gold mx-auto" style={{ margin: '0 auto 1.5rem' }} />
            <h2 className="display-sm text-[#2F2E2D] mb-12 text-center">{dict.product.usage_heading}</h2>
            <ol className="space-y-4">
              {content.usage.map((step, i) => (
                <li key={i} className="flex items-center gap-5 bg-white rounded-xl p-6">
                  <span className="w-9 h-9 rounded-full bg-[#D9A91B] text-[#2F2E2D] font-extrabold text-sm flex items-center justify-center flex-shrink-0">
                    {i + 1}
                  </span>
                  <span className="text-[#2F2E2D] font-medium">{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* ── CHINA MARKET ENTRY ── */}
      <section className="py-24 max-w-7xl mx-auto px-6">
        <div className="divider-gold" />
        <h2 className="display-sm text-[#2F2E2D] mb-10">{dict.product.regulatory_heading}</h2>
        <div className="max-w-3xl">
          <RegulatoryCard
            chinaStatus={regulatory.chinaStatus}
            nmpaPath={regulatory.nmpaPath}
            labels={dict.regulatory}
          />
        </div>
      </section>

      {/* ── DISTRIBUTOR CTA ── */}
      <section className="bg-[#2F2E2D] py-20 text-center">
        <div className="max-w-xl mx-auto px-6">
          <h3 className="display-sm text-white mb-4">{d.home.b2b_section.headline}</h3>
          <p className="text-white/50 mb-8 text-sm leading-relaxed">{d.home.b2b_section.body}</p>
          <Link
            href={`/${locale}/b2b`}
            className="inline-block bg-[#D9A91B] text-[#2F2E2D] font-bold text-sm uppercase tracking-wider px-10 py-4 rounded-full hover:bg-[#F0C84A] transition-colors duration-200"
          >
            {d.home.b2b_section.cta} →
          </Link>
          <div className="mt-8 space-y-2">
            <p className="text-white/60 text-xs">{dict.product.compliance.label1}</p>
            <p className="text-white/60 text-xs">{dict.product.compliance.label2}</p>
          </div>
        </div>
      </section>

    </div>
  )
}
