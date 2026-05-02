/**
 * Renders a product image with a premium CSS fallback if the image isn't available.
 * Swap in real Imagen 4 images by running scripts/generate-images.mjs after enabling billing.
 */

const GRADIENTS: Record<string, string> = {
  'pine-pollen-face-mask': 'radial-gradient(ellipse at 30% 40%, #C4961A 0%, #8B6A12 35%, #3D3C3A 70%, #2F2E2D 100%)',
  'pine-pollen-tablets':   'radial-gradient(ellipse at 60% 30%, #D9A91B 0%, #9B7611 40%, #3D3C3A 70%, #2F2E2D 100%)',
  'body-cream':            'radial-gradient(ellipse at 40% 60%, #E4D8C3 0%, #C4B49A 30%, #5A5856 65%, #2F2E2D 100%)',
  'hero-forest':           'linear-gradient(160deg, #1A2F1A 0%, #2A4A1A 30%, #3D5A1A 55%, #2F3A1A 75%, #1A1918 100%)',
  'pollen-close':          'radial-gradient(ellipse at 50% 50%, #F0C84A 0%, #D9A91B 25%, #8B6A12 55%, #2F2E2D 100%)',
}

export function ProductImageCSS({ slug, className = '' }: { slug: string; className?: string }) {
  const gradient = GRADIENTS[slug] || GRADIENTS['pine-pollen-tablets']
  return (
    <div
      className={className}
      style={{ background: gradient }}
    >
      <svg width="100%" height="100%" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg" className="opacity-10">
        <circle cx="200" cy="200" r="120" fill="none" stroke="#D9A91B" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="80" fill="none" stroke="#D9A91B" strokeWidth="0.5" />
        <circle cx="200" cy="200" r="40" fill="none" stroke="#D9A91B" strokeWidth="0.5" />
        {Array.from({ length: 12 }).map((_, i) => (
          <line
            key={i}
            x1="200" y1="200"
            x2={200 + 120 * Math.cos((i * 30 * Math.PI) / 180)}
            y2={200 + 120 * Math.sin((i * 30 * Math.PI) / 180)}
            stroke="#D9A91B"
            strokeWidth="0.3"
            opacity="0.5"
          />
        ))}
      </svg>
    </div>
  )
}
