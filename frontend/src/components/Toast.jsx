import { AlertCircle, CheckCircle2, X } from 'lucide-react'

export default function Toast({ toast, onClose }) {
  if (!toast) {
    return null
  }

  const isError = toast.type === 'error'
  const icon = isError ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />

  return (
    <div className="fixed bottom-5 right-5 z-[60] max-w-[360px]">
      <div
        className={`rounded-2xl border px-4 py-3 shadow-[0_20px_60px_-30px_rgba(15,23,42,0.38)] backdrop-blur-xl ${
          isError ? 'border-rose-200 bg-rose-50/95 text-rose-800' : 'border-emerald-200 bg-emerald-50/95 text-emerald-800'
        }`}
      >
        <div className="flex items-start gap-3">
          <div className="mt-0.5">{icon}</div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold">{toast.title}</p>
            <p className="mt-1 text-sm leading-5 opacity-90">{toast.description}</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-lg p-1 transition hover:bg-black/5">
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
