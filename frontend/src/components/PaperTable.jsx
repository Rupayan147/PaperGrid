function Badge({ children, tone = 'slate' }) {
  const toneClasses = {
    blue: 'bg-blue-50 text-blue-700 border-blue-200',
    indigo: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    slate: 'bg-slate-100 text-slate-700 border-slate-200',
    amber: 'bg-amber-50 text-amber-700 border-amber-200',
    green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    purple: 'bg-violet-50 text-violet-700 border-violet-200',
  }

  return (
    <span className={`inline-flex max-w-full items-center rounded-full border px-2 py-1 text-xs font-semibold leading-none ${toneClasses[tone]}`}>
      {children}
    </span>
  )
}

function formatPills(value, tone, maxItems = 2) {
  const items = (value || '')
    .split(/[,;/|]/)
    .map((item) => item.trim())
    .filter(Boolean)

  if (items.length === 0) {
    return <span className="text-sm text-slate-400">-</span>
  }

  const visibleItems = items.slice(0, maxItems)
  const remaining = items.length - visibleItems.length

  return (
    <div className="flex flex-wrap gap-1.5">
      {visibleItems.map((item) => (
        <Badge key={item} tone={tone}>
          <span className="max-w-[120px] truncate" title={item}>{item}</span>
        </Badge>
      ))}
      {remaining > 0 ? <Badge tone="slate">+{remaining} more</Badge> : null}
    </div>
  )
}

function sourceLabel(source) {
  switch ((source || '').toLowerCase()) {
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
}

function limitationTone(source) {
  switch ((source || '').toLowerCase()) {
    case 'explicit':
      return 'green'
    case 'inferred':
      return 'amber'
    case 'manual':
      return 'slate'
    case 'related_papers':
      return 'purple'
    default:
      return 'amber'
  }
}

function LimitationCell({ limitation, limitationSource }) {
  return (
    <div className="flex max-w-full flex-col gap-1.5">
      <div className="flex flex-wrap items-center gap-2">
        <Badge tone={limitationTone(limitationSource)}>{sourceLabel(limitationSource)}</Badge>
      </div>
      <div className="max-w-full truncate text-sm leading-5 text-slate-700" title={limitation || ''}>
        {limitation || '-'}
      </div>
    </div>
  )
}

export default function PaperTable({ papers, loading, onEdit, onDelete, onView, searchTerm, setSearchTerm, onRefresh }) {
  return (
    <section id="survey-table" className="overflow-hidden rounded-[1.5rem] border border-slate-200/80 bg-white/90 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.22)] backdrop-blur">
      <div className="border-b border-slate-200/80 px-4 py-4 sm:px-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold tracking-tight text-slate-950">Literature Survey Table</h2>
            <p className="mt-1 text-sm text-slate-500">Review, edit, compare, and export extracted paper data.</p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row lg:w-auto lg:items-center">
            <div className="relative lg:w-[360px]">
              <span className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-slate-400">Search</span>
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="papers, methods, datasets, results..."
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-2.5 pl-20 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:bg-white"
              />
            </div>
            <button
              type="button"
              onClick={onRefresh}
              className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Refresh
            </button>
            <button
              type="button"
              onClick={() => window.open('http://localhost:8000/export/csv', '_blank')}
              className="rounded-2xl border border-indigo-200 bg-indigo-50 px-4 py-2.5 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-100"
            >
              Export
            </button>
          </div>
        </div>
      </div>

      <div className="max-h-[calc(100vh-404px)] overflow-auto custom-scrollbar">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm text-slate-700">
          <thead className="sticky top-0 z-10 bg-slate-50/95 text-xs uppercase tracking-[0.16em] text-slate-500 backdrop-blur">
            <tr>
              <th className="w-[260px] px-4 py-3 font-semibold">Title</th>
              <th className="w-[80px] px-4 py-3 font-semibold">Year</th>
              <th className="w-[180px] px-4 py-3 font-semibold">Authors</th>
              <th className="w-[180px] px-4 py-3 font-semibold">Method</th>
              <th className="w-[140px] px-4 py-3 font-semibold">Dataset</th>
              <th className="w-[130px] px-4 py-3 font-semibold">Metrics</th>
              <th className="w-[260px] px-4 py-3 font-semibold">Result</th>
              <th className="w-[220px] px-4 py-3 font-semibold">Limitation</th>
              <th className="w-[120px] px-4 py-3 font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white/90">
            {loading ? (
              <tr>
                <td className="px-4 py-8 text-slate-500" colSpan={9}>
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                    Loading literature table...
                  </div>
                </td>
              </tr>
            ) : papers.length === 0 ? (
              <tr>
                <td className="px-4 py-8 text-slate-500" colSpan={9}>
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 px-6 py-14 text-center">
                    <p className="text-base font-semibold text-slate-900">No papers mapped yet</p>
                    <p className="mt-2 text-sm text-slate-500">Upload your first PDF to start building your literature survey.</p>
                    <button
                      type="button"
                      onClick={() => document.getElementById('upload-strip')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
                      className="mt-5 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500"
                    >
                      Upload Paper
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              papers.map((paper, index) => (
                <tr
                  key={paper.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => onView(paper)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault()
                      onView(paper)
                    }
                  }}
                  className={`cursor-pointer border-t border-slate-100 align-top transition hover:bg-slate-50/80 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/40'}`}
                >
                  <td className="px-4 py-4 align-top font-medium text-slate-950">
                    <div className="max-w-[240px] truncate text-sm font-semibold leading-5" title={paper.title || 'Untitled paper'}>
                      {paper.title || 'Untitled paper'}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <Badge tone="blue">{paper.year || '-'}</Badge>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="max-w-[170px] truncate text-sm leading-5" title={paper.authors || ''}>
                      {paper.authors || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    {formatPills(paper.method, 'indigo')}
                  </td>
                  <td className="px-4 py-4 align-top">
                    {formatPills(paper.dataset, 'cyan')}
                  </td>
                  <td className="px-4 py-4 align-top">
                    {formatPills(paper.metrics, 'slate')}
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="max-w-[240px] truncate text-sm leading-5" title={paper.result || ''}>
                      {paper.result || '-'}
                    </div>
                  </td>
                  <td className="px-4 py-4 align-top">
                    <LimitationCell limitation={paper.limitation} limitationSource={paper.limitation_source} />
                  </td>
                  <td className="px-4 py-4 align-top">
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onView(paper)
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        View
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onEdit(paper)
                        }}
                        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation()
                          onDelete(paper.id)
                        }}
                        className="rounded-lg border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-600 transition hover:bg-rose-50"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}
