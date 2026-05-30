import { FileText, ArrowRight, Upload } from 'lucide-react'

function StatusPill({ children }) {
  return (
    <span className="inline-flex items-center rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 shadow-sm backdrop-blur-xl">
      {children}
    </span>
  )
}

export default function HeroSection({ heroStats }) {
  return (
    <section className="relative overflow-hidden rounded-[1.75rem] border border-slate-200/80 bg-white/78 p-5 shadow-[0_22px_60px_-40px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:p-6">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(99,102,241,0.12),_transparent_28%),radial-gradient(circle_at_bottom_left,_rgba(34,211,238,0.09),_transparent_22%)]" />
      <div className="relative grid min-h-[300px] gap-5 xl:grid-cols-[1.25fr_0.75fr] xl:items-center">
        <div className="max-w-3xl">
          <div className="mb-4 flex flex-wrap gap-2">
            <StatusPill>PDF Extraction Active</StatusPill>
            <StatusPill>SQLite Connected</StatusPill>
            <StatusPill>Limitation Intelligence</StatusPill>
          </div>

          <h2 className="max-w-2xl text-4xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
            Turn Research Papers Into Survey Tables
          </h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-500">
            Upload PDFs, extract metadata, analyze limitations, and export structured literature reviews.
          </p>

          <div className="mt-5 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => document.getElementById('upload-strip')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
              className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white shadow-[0_18px_34px_-22px_rgba(79,70,229,0.45)] transition hover:from-indigo-500 hover:to-violet-500"
            >
              <Upload className="h-4 w-4" />
              Upload Paper
            </button>
            <button
              type="button"
              onClick={() => document.getElementById('survey-table')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View Table
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-0 -z-10 rounded-[1.5rem] bg-gradient-to-br from-indigo-500/20 via-violet-500/15 to-cyan-400/15 blur-2xl" />
          <div className="rounded-[1.5rem] border border-white/60 bg-white/70 p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.26)] backdrop-blur-xl">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Preview</p>
                <p className="mt-1 text-lg font-semibold text-slate-950">Survey Status</p>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-sm">
                <FileText className="h-5 w-5" />
              </div>
            </div>

            <div className="grid gap-3">
              {heroStats.map((card) => (
                <div key={card.label} className="rounded-2xl border border-slate-200 bg-white/85 px-4 py-3">
                  <div className={`mb-2 h-1.5 w-12 rounded-full bg-gradient-to-r ${card.accent}`} />
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{card.label}</p>
                  <p className="mt-1 text-2xl font-semibold tracking-tight text-slate-950">{card.value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
