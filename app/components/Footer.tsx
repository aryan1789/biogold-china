import Link from 'next/link'
import Image from 'next/image'
import type { Locale } from '@/lib/dictionaries'

export default function Footer({ dict, locale }: { dict: any; locale: Locale }) {
  return (
    <footer className="bg-[#1A1918] text-white">
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-10">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <div className="flex items-center gap-3 mb-4">
              <Image src="/logo/biogold-logo.png" alt="Bio Gold" width={44} height={44} className="rounded-full opacity-90" />
              <span className="font-extrabold text-xl tracking-tight">Bio Gold<sup className="text-[10px] text-[#D9A91B]">®</sup></span>
            </div>
            <p className="text-white/40 text-sm leading-relaxed max-w-xs">{dict.footer.tagline}</p>
            <p className="text-white/30 text-xs mt-3">{dict.footer.entity}</p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">{dict.footer.products_heading}</p>
            <ul className="space-y-3">
              {dict.footer.products.map((p: { slug: string; label: string }) => (
                <li key={p.slug}>
                  <Link href={`/${locale}/products/${p.slug}`} className="text-sm text-white/50 hover:text-white transition-colors">{p.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-widest text-white/30 mb-4">{dict.footer.company_heading}</p>
            <ul className="space-y-3">
              {[
                { href: `/${locale}/research`, label: dict.nav.research },
                { href: `/${locale}/b2b`, label: dict.nav.b2b },
                { href: `/${locale}/generate`, label: dict.nav.generate },
              ].map(({ href, label }) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-white/50 hover:text-white transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-8 space-y-3">
          <div className="grid md:grid-cols-2 gap-3">
            <p className="text-xs text-white/30 leading-relaxed">{dict.footer.compliance1}</p>
            <p className="text-xs text-white/30 leading-relaxed">{dict.footer.compliance2}</p>
          </div>
          <p className="text-xs text-white/20 pt-2">
            © {new Date().getFullYear()} Pine Pollen New Zealand Limited. All rights reserved. New Zealand.
          </p>
        </div>
      </div>
    </footer>
  )
}
