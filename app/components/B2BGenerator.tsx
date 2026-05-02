'use client'

import { useState } from 'react'

interface B2BDict {
  form: {
    company_label: string
    company_placeholder: string
    submit: string
    loading: string
    success: string
    download: string
  }
}

export default function B2BGenerator({ dict, locale }: { dict: B2BDict; locale: string }) {
  const [company, setCompany] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!company.trim()) return

    setStatus('loading')
    setError('')
    setPdfUrl(null)

    try {
      const res = await fetch('/api/generate-proposal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ company, locale }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Generation failed')
      }

      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      setPdfUrl(url)
      setStatus('done')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
      setStatus('error')
    }
  }

  return (
    <div className="bg-white border border-beige rounded-2xl p-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-charcoal mb-2">
            {dict.form.company_label}
          </label>
          <input
            type="text"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder={dict.form.company_placeholder}
            className="w-full border border-beige rounded-xl px-4 py-3 text-charcoal placeholder:text-charcoal/30 focus:outline-none focus:ring-2 focus:ring-gold/30 focus:border-gold transition-colors"
            disabled={status === 'loading'}
          />
        </div>

        <button
          type="submit"
          disabled={status === 'loading' || !company.trim()}
          className="w-full bg-gold text-white font-semibold py-4 rounded-xl hover:bg-gold/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? dict.form.loading : dict.form.submit}
        </button>

        {status === 'loading' && (
          <div className="flex items-center gap-3 text-sm text-charcoal/60">
            <div className="w-4 h-4 rounded-full border-2 border-gold border-t-transparent animate-spin" />
            <span>{dict.form.loading}</span>
          </div>
        )}

        {status === 'done' && pdfUrl && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="text-green-800 font-medium mb-4">{dict.form.success}</p>
            <a
              href={pdfUrl}
              download={`Bio-Gold-Proposal-${company.replace(/\s+/g, '-')}.pdf`}
              className="inline-block bg-charcoal text-white font-semibold px-6 py-3 rounded-full hover:bg-charcoal/80 transition-colors"
            >
              {dict.form.download}
            </a>
          </div>
        )}

        {status === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </form>
    </div>
  )
}
