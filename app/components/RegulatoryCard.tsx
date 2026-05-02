interface RegulatoryCardProps {
  chinaStatus: string
  nmpaPath: string
  labels: {
    china_status_label: string
    nmpa_label: string
    snapshot_heading: string
  }
}

export default function RegulatoryCard({ chinaStatus, nmpaPath, labels }: RegulatoryCardProps) {
  return (
    <div className="border border-gold/30 rounded-2xl overflow-hidden">
      <div className="bg-gold/10 px-6 py-4 border-b border-gold/20">
        <h3 className="font-bold text-charcoal flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-gold inline-block" />
          {labels.snapshot_heading}
        </h3>
      </div>
      <div className="p-6 space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-3">
            {labels.china_status_label}
          </p>
          <p className="text-sm text-charcoal/80 leading-relaxed">{chinaStatus}</p>
        </div>
        <div className="border-t border-beige pt-6">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-3">
            {labels.nmpa_label}
          </p>
          <p className="text-sm text-charcoal/80 leading-relaxed whitespace-pre-line">{nmpaPath}</p>
        </div>
      </div>
    </div>
  )
}
