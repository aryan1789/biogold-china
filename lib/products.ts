import type { Locale } from './dictionaries'

export interface ProductContent {
  name: string
  tagline: string
  hero: { headline: string; subheadline: string }
  benefits: Array<{ title: string; description: string }>
  mechanism: string
  ingredientStory: string
  usage: string[]
  credibility: Array<{ stat: string; label: string }>
  claims: string[]
}

export interface RegulatoryInfo {
  chinaStatus: string
  nmpaPath: string
}

export interface Product {
  slug: string
  image: string
  category: string
  en: ProductContent
  zh: ProductContent
  regulatory: {
    en: RegulatoryInfo
    zh: RegulatoryInfo
  }
}

export async function getProduct(slug: string): Promise<Product | null> {
  try {
    const product = await import(`../products/${slug}.json`)
    return product.default as Product
  } catch {
    return null
  }
}

export async function getAllProducts(): Promise<Product[]> {
  const slugs = ['pine-pollen-face-mask', 'pine-pollen-tablets', 'body-cream']
  const products = await Promise.all(slugs.map(getProduct))
  return products.filter(Boolean) as Product[]
}

export function getLocalizedContent(product: Product, locale: Locale): ProductContent {
  return product[locale]
}

export function getLocalizedRegulatory(product: Product, locale: Locale): RegulatoryInfo {
  return product.regulatory[locale]
}
