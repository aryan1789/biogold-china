'use client'

import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect, useRef } from 'react'
import type { Locale } from '@/lib/dictionaries'

interface NavDict {
  nav: {
    products: string
    research: string
    b2b: string
    tagline: string
    distributor_cta: string
  }
  footer: {
    products: Array<{ slug: string; label: string }>
  }
}

export default function Navigation({ dict, locale }: { dict: NavDict; locale: Locale }) {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [productsOpen, setProductsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const otherLocale = locale === 'en' ? 'zh' : 'en'
  const otherPath = pathname.replace(`/${locale}`, `/${otherLocale}`)
  const isHome = pathname === `/${locale}` || pathname === `/${locale}/`

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProductsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const solidNav = !isHome || scrolled

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      solidNav
        ? 'bg-[#2F2E2D]/97 backdrop-blur-md border-b border-white/5'
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href={`/${locale}`} className="flex items-center gap-3 group">
          <Image
            src="/logo/biogold-logo.png"
            alt="Bio Gold"
            width={40}
            height={40}
            className="rounded-full"
          />
          <div>
            <span className="font-extrabold text-white text-base tracking-tight leading-none">Bio Gold<sup className="text-[8px] text-[#D9A91B]">®</sup></span>
            <p className="text-[10px] text-white/40 leading-none mt-0.5 font-medium tracking-wider uppercase">{dict.nav.tagline}</p>
          </div>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {/* Products dropdown */}
          <div
            ref={dropdownRef}
            className="relative"
            onMouseEnter={() => setProductsOpen(true)}
            onMouseLeave={() => setProductsOpen(false)}
          >
            <button
              className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-200 flex items-center gap-1"
              onClick={() => setProductsOpen((o) => !o)}
            >
              {dict.nav.products}
              <svg
                className={`w-3 h-3 transition-transform duration-200 ${productsOpen ? 'rotate-180' : ''}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {productsOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 w-56">
                <div className="pt-3">
                  <div className="bg-[#2F2E2D] border border-white/10 rounded-xl overflow-hidden shadow-2xl">
                    <div className="py-1">
                      {dict.footer.products.map((p) => (
                        <Link
                          key={p.slug}
                          href={`/${locale}/products/${p.slug}`}
                          onClick={() => setProductsOpen(false)}
                          className="block px-5 py-3 text-sm text-white/60 hover:text-white hover:bg-white/5 transition-colors duration-150"
                        >
                          {p.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {[
            { href: `/${locale}/research`, label: dict.nav.research },
            { href: `/${locale}/b2b`, label: dict.nav.b2b },
          ].map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className="text-sm font-medium text-white/60 hover:text-white transition-colors duration-200"
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={otherPath}
            className="text-sm font-bold text-white/60 hover:text-white border border-white/20 hover:border-white/50 px-3 py-1.5 rounded-full transition-all duration-200"
          >
            {locale === 'en' ? '中文' : 'EN'}
          </Link>
        </div>
      </div>
    </nav>
  )
}
