export default function PaperDetailDrawer({ paper, onClose, onEdit }) {
  if (!paper) {
    return null
  }

  const limitationSource = (paper.limitation_source || '').toLowerCase()

  const limitationSourceLabel = (() => {
    switch (limitationSource) {
      case 'explicit':
        return 'Explicit'
      case 'inferred':
        return 'Inferred'
      case 'manual':
        return 'Manual'
      case 'related_papers':
        return 'Related Papers'
      default:
        return 'Inferred'
    }
  })()

  const limitationSourceTone = (() => {
    switch (limitationSource) {
      case 'explicit':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200'
      case 'inferred':
        return 'bg-amber-50 text-amber-700 border-amber-200'
      case 'manual':
        return 'bg-slate-100 text-slate-700 border-slate-200'
      case 'related_papers':
        return 'bg-violet-50 text-violet-700 border-violet-200'
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200'
    }
  })()

  const sections = [
    ['Title', paper.title || '-'],
    ['Year', paper.year || '-'],
    ['Authors', paper.authors || '-'],
    ['Method', paper.method || '-'],
    ['Dataset', paper.dataset || '-'],
    ['Metrics', paper.metrics || '-'],
    ['Result', paper.result || '-'],
    ['Limitation', paper.limitation || '-'],
  ]

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/35 backdrop-blur-[2px]"
        aria-label="Close drawer"
        onClick={onClose}
      />

      <aside className="absolute right-0 top-0 flex h-full w-full max-w-[480px] flex-col border-l border-slate-200 bg-white/95 shadow-[0_24px_60px_-30px_rgba(15,23,42,0.35)] backdrop-blur-xl">
        <div className="border-b border-slate-200 px-5 py-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-700">Paper details</p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-slate-950">{paper.title || 'Untitled paper'}</h3>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
            >
              Close
            </button>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">{paper.year || 'Year N/A'}</span>
            <span className="text-xs text-slate-400">ID {paper.id}</span>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5">
          <div className="space-y-4">
            {sections.map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.18)]">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-800">{value}</p>
              </div>
            ))}
            <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 shadow-[0_10px_24px_-22px_rgba(15,23,42,0.18)]">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Limitation Source</p>
              <span className={`mt-2 inline-flex rounded-full border px-2 py-1 text-xs font-semibold ${limitationSourceTone}`}>
                {limitationSourceLabel}
              </span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={() => onEdit(paper)}
            className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Edit Paper
          </button>
        </div>
      </aside>
    </div>
  )
}
