'use client'

import { useState } from 'react'
import Image from 'next/image'

interface GenerateDict {
  form: {
    name_label: string
    name_placeholder: string
    claims_label: string
    claims_placeholder: string
    submit: string
    loading: string
  }
}

interface GeneratedPage {
  en: {
    name: string
    tagline: string
    hero: { headline: string; subheadline: string }
    benefits: Array<{ title: string; description: string }>
    mechanism: string
    ingredientStory: string
    usage: string[]
  }
  zh: {
    name: string
    tagline: string
    hero: { headline: string; subheadline: string }
    benefits: Array<{ title: string; description: string }>
    mechanism: string
    ingredientStory: string
    usage: string[]
  }
}

const DEMO = {
  name: 'Pine Pollen Eye Serum',
  claims: 'Reduces fine lines\nFirms and brightens\nDeep cellular hydration',
}

export default function ProductGenerator({ dict, locale }: { dict: GenerateDict; locale: string }) {
  const [name, setName] = useState('')
  const [claims, setClaims] = useState('')
  const [status, setStatus] = useState<'idle' | 'generating-copy' | 'generating-image' | 'done' | 'error'>('idle')
  const [generated, setGenerated] = useState<GeneratedPage | null>(null)
  const [productImage, setProductImage] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return

    setStatus('generating-copy')
    setError('')
    setGenerated(null)
    setProductImage(null)

    const claimsArr = claims.split('\n').filter((c) => c.trim())

    try {
      // Step 1: generate bilingual copy
      const copyRes = await fetch('/api/generate-page', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, claims: claimsArr, locale }),
      })
      if (!copyRes.ok) throw new Error('Copy generation failed')
      const copyData = await copyRes.json()
      setGenerated(copyData)

      // Step 2: generate product image
      setStatus('generating-image')
      const imgRes = await fetch('/api/generate-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, claims: claimsArr }),
      })
      if (imgRes.ok) {
        const imgData = await imgRes.json()
        if (imgData.image) setProductImage(imgData.image)
      }

      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  const content = generated ? (locale === 'zh' && generated.zh ? generated.zh : generated.en) : null

  const statusLabel = {
    'generating-copy': locale === 'zh' ? '正在生成产品文案……' : 'Generating product copy...',
    'generating-image': locale === 'zh' ? '正在生成产品图片……' : 'Generating product image...',
  }[status] ?? dict.form.loading

  return (
    <div className="space-y-8">
      {/* Form */}
      <div className="bg-white border border-[#E4D8C3] rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-[#2F2E2D]">{dict.form.name_label}</label>
              <button
                type="button"
                onClick={() => { setName(DEMO.name); setClaims(DEMO.claims) }}
                disabled={status === 'generating-copy' || status === 'generating-image'}
                className="text-xs text-[#D9A91B] font-semibold hover:underline disabled:opacity-40"
              >
                {locale === 'zh' ? '加载示例' : 'Load example'}
              </button>
            </div>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={dict.form.name_placeholder}
              className="w-full border border-[#E4D8C3] rounded-xl px-4 py-3 text-[#2F2E2D] placeholder:text-[#2F2E2D]/30 focus:outline-none focus:ring-2 focus:ring-[#D9A91B]/30 focus:border-[#D9A91B] transition-colors"
              disabled={status === 'generating-copy' || status === 'generating-image'}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-[#2F2E2D] mb-2">{dict.form.claims_label}</label>
            <textarea
              value={claims}
              onChange={(e) => setClaims(e.target.value)}
              placeholder={dict.form.claims_placeholder}
              rows={4}
              className="w-full border border-[#E4D8C3] rounded-xl px-4 py-3 text-[#2F2E2D] placeholder:text-[#2F2E2D]/30 focus:outline-none focus:ring-2 focus:ring-[#D9A91B]/30 focus:border-[#D9A91B] transition-colors resize-none"
              disabled={status === 'generating-copy' || status === 'generating-image'}
            />
          </div>
          <button
            type="submit"
            disabled={status === 'generating-copy' || status === 'generating-image' || !name.trim()}
            className="w-full bg-[#D9A91B] text-[#2F2E2D] font-bold text-sm uppercase tracking-wider py-4 rounded-xl hover:bg-[#F0C84A] transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {(status === 'generating-copy' || status === 'generating-image') ? statusLabel : dict.form.submit}
          </button>

          {(status === 'generating-copy' || status === 'generating-image') && (
            <div className="flex items-center gap-3 text-sm text-[#5A5856]">
              <div className="w-4 h-4 rounded-full border-2 border-[#D9A91B] border-t-transparent animate-spin" />
              <span>{statusLabel}</span>
            </div>
          )}

          {status === 'error' && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4">
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          )}
        </form>
      </div>

      {/* Preview */}
      {status === 'done' && content && (
        <div className="border border-[#D9A91B]/30 rounded-2xl overflow-hidden">
          {/* Header */}
          <div className="bg-[#D9A91B]/10 px-6 py-4 border-b border-[#D9A91B]/20 flex items-center justify-between">
            <span className="font-bold text-[#2F2E2D]">{content.name}</span>
            <span className="text-xs bg-green-100 text-green-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">
              {locale === 'zh' ? '预览' : 'Live Preview'}
            </span>
          </div>

          <div className="bg-white">
            {/* Product image */}
            <div className="relative h-72 bg-[#2F2E2D] overflow-hidden">
              {productImage ? (
                <img
                  src={productImage}
                  alt={content.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <div className="flex items-center gap-3 text-white/40 text-sm">
                    <div className="w-4 h-4 rounded-full border-2 border-white/40 border-t-transparent animate-spin" />
                    <span>{locale === 'zh' ? '图片生成中……' : 'Generating image...'}</span>
                  </div>
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
              <div className="absolute bottom-4 left-6">
                <span className="text-[#D9A91B] font-bold text-2xl">{content.name}</span>
                <p className="text-white/70 text-sm italic mt-1">{content.tagline}</p>
              </div>
            </div>

            <div className="p-8 space-y-8">
              {/* Hero */}
              <div>
                <h2 className="font-extrabold text-2xl text-[#2F2E2D] mb-3">{content.hero.headline}</h2>
                <p className="text-[#5A5856] leading-relaxed">{content.hero.subheadline}</p>
              </div>

              {/* Benefits */}
              <div className="grid md:grid-cols-2 gap-4">
                {content.benefits.map((b, i) => (
                  <div key={i} className="border border-[#E4D8C3] rounded-xl p-5 bg-[#F5F0E8]">
                    <h4 className="font-bold text-[#2F2E2D] mb-2">{b.title}</h4>
                    <p className="text-sm text-[#5A5856] leading-relaxed">{b.description}</p>
                  </div>
                ))}
              </div>

              {/* Mechanism */}
              <div className="bg-[#2F2E2D] rounded-xl p-6">
                <h4 className="font-bold text-white mb-3">{locale === 'zh' ? '作用原理' : 'How It Works'}</h4>
                <p className="text-white/70 text-sm leading-relaxed">{content.mechanism}</p>
              </div>

              {/* Ingredient story */}
              <div className="bg-[#F5F0E8] rounded-xl p-6">
                <h4 className="font-bold text-[#2F2E2D] mb-3">{locale === 'zh' ? '原料故事' : 'The Ingredient Story'}</h4>
                <p className="text-[#5A5856] text-sm leading-relaxed">{content.ingredientStory}</p>
              </div>

              {/* Usage */}
              <div>
                <h4 className="font-bold text-[#2F2E2D] mb-4">{locale === 'zh' ? '使用方法' : 'How to Use'}</h4>
                <ol className="space-y-3">
                  {content.usage.map((step, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <span className="w-6 h-6 rounded-full bg-[#D9A91B] text-[#2F2E2D] text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                      <span className="text-[#5A5856] text-sm">{step}</span>
                    </li>
                  ))}
                </ol>
              </div>

              <p className="text-xs text-[#5A5856]/50 border-t border-[#E4D8C3] pt-4">
                {locale === 'zh'
                  ? '请仔细阅读标签并按照使用说明使用。若症状持续，请咨询医疗专业人员。'
                  : 'Always read the label and follow the directions for use. If symptoms persist, talk to your health professional.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
