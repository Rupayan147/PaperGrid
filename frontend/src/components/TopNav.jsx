import { FileDown, LayoutGrid, RefreshCw, Upload } from 'lucide-react'

export default function TopNav({ onRefresh }) {
  return (
    <header className="rounded-[1.5rem] border border-slate-200/80 bg-white/78 px-4 py-3.5 shadow-[0_18px_50px_-36px_rgba(15,23,42,0.24)] backdrop-blur-xl sm:px-5">
      <div className="flex flex-col gap-3 xl:h-[72px] xl:flex-row xl:items-center xl:justify-between xl:gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-[0_16px_30px_-20px_rgba(15,23,42,0.4)]">
            <LayoutGrid className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-[1.35rem] font-semibold tracking-tight text-slate-950">PaperGrid</h1>
            <p className="text-sm text-slate-500">Research Paper Mapper</p>
            <div className="mt-1 inline-flex rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-500">
              Literature Survey Workspace
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={onRefresh}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => window.open('http://localhost:8000/export/csv', '_blank')}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <FileDown className="h-4 w-4" />
            Export CSV
          </button>
          <button
            type="button"
            onClick={() => window.open('http://localhost:8000/export/excel', '_blank')}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-2.5 text-sm font-semibold text-white shadow-[0_16px_30px_-18px_rgba(79,70,229,0.5)] transition hover:from-indigo-500 hover:to-violet-500"
          >
            <Upload className="h-4 w-4" />
            Export Excel
          </button>
        </div>
      </div>
    </header>
  )
}
