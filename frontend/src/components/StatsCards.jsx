function StatCard({ label, value, accent }) {
  return (
    <article className="group relative overflow-hidden rounded-[1.25rem] border border-slate-200/80 bg-white/90 px-4 py-3.5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.22)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_-28px_rgba(15,23,42,0.26)]">
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${accent}`} />
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">{label}</p>
          <p className="mt-1.5 text-[1.55rem] font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <div className={`flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br ${accent} text-white shadow-md shadow-slate-900/10`}>
          <span className="h-2.5 w-2.5 rounded-full bg-white/90" />
        </div>
      </div>
      <p className="mt-1.5 text-xs text-slate-500">Live summary across the mapped survey.</p>
    </article>
  )
}

export default function StatsCards({ totalPapers, methodsFound, datasetsFound, metricsFound }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <StatCard label="Total Papers" value={totalPapers} accent="from-indigo-600 to-blue-500" />
      <StatCard label="Methods Found" value={methodsFound} accent="from-violet-600 to-indigo-500" />
      <StatCard label="Datasets Found" value={datasetsFound} accent="from-cyan-500 to-blue-500" />
      <StatCard label="Metrics Found" value={metricsFound} accent="from-slate-700 to-slate-500" />
    </section>
  )
}
