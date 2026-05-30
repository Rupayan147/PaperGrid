import { useState } from 'react'

const EMPTY_FORM = {
  title: '',
  year: '',
  authors: '',
  method: '',
  dataset: '',
  metrics: '',
  result: '',
  limitation: '',
}

export default function EditPaperModal({ paper, onClose, onSave }) {
  const [formData, setFormData] = useState(() =>
    paper
      ? {
          title: paper.title ?? '',
          year: paper.year ?? '',
          authors: paper.authors ?? '',
          method: paper.method ?? '',
          dataset: paper.dataset ?? '',
          metrics: paper.metrics ?? '',
          result: paper.result ?? '',
          limitation: paper.limitation ?? '',
        }
      : EMPTY_FORM,
  )

  if (!paper) {
    return null
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    await onSave(paper.id, formData)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4 backdrop-blur-sm"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          onClose()
        }
      }}
    >
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-[0_18px_50px_-28px_rgba(15,23,42,0.28)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-blue-700">Edit paper</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900">Update survey fields</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <form className="mt-5 grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          {[
            ['title', 'Title'],
            ['year', 'Year'],
            ['authors', 'Authors'],
            ['method', 'Method'],
            ['dataset', 'Dataset'],
            ['metrics', 'Metrics'],
          ].map(([field, label]) => (
            <label key={field} className="space-y-2">
              <span className="text-sm font-medium text-slate-700">{label}</span>
              <input
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
                value={formData[field]}
                onChange={(event) => setFormData((current) => ({ ...current, [field]: event.target.value }))}
              />
            </label>
          ))}

          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Result</span>
            <textarea
              className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
              value={formData.result}
              onChange={(event) => setFormData((current) => ({ ...current, result: event.target.value }))}
            />
          </label>

          <label className="space-y-2 sm:col-span-2">
            <span className="text-sm font-medium text-slate-700">Limitation</span>
            <textarea
              className="min-h-24 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-400 focus:bg-white"
              value={formData.limitation}
              onChange={(event) => setFormData((current) => ({ ...current, limitation: event.target.value }))}
            />
          </label>

          <div className="flex flex-wrap justify-end gap-3 sm:col-span-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-2xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
            >
              Save changes
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
