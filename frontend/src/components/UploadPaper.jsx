import { FileText } from 'lucide-react'
import { useState } from 'react'

export default function UploadPaper({ onUpload, uploading, message, error, onUploadPaper }) {
  const [selectedFile, setSelectedFile] = useState(null)
  const [localError, setLocalError] = useState('')

  const handleSubmit = async (event) => {
    event.preventDefault()

    if (!selectedFile) {
      setLocalError('Choose a PDF file first.')
      return
    }

    setLocalError('')
    await onUpload(selectedFile)
    setSelectedFile(null)
  }

  return (
    <section id="upload-strip" className="rounded-[1.25rem] border border-slate-200/80 bg-white/85 p-4 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.22)] backdrop-blur-sm">
      <form className="flex min-h-[96px] flex-col gap-3 lg:flex-row lg:items-stretch lg:gap-4" onSubmit={handleSubmit}>
        <div className="flex items-center gap-4 lg:w-[280px]">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-cyan-500 text-white shadow-[0_14px_28px_-18px_rgba(79,70,229,0.45)]">
            <FileText className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-slate-950">Upload Research Paper</p>
            <p className="text-sm text-slate-500">Drop or select a PDF to extract metadata</p>
          </div>
        </div>

        <label className="flex flex-1 cursor-pointer items-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 transition hover:border-indigo-300 hover:bg-indigo-50/30">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-slate-900">
              {selectedFile ? selectedFile.name : 'Choose a PDF file to extract paper metadata'}
            </p>
            <p className="mt-0.5 text-xs text-slate-500">PDF only. The file stays local until you upload.</p>
          </div>
          <input
            className="hidden"
            type="file"
            accept="application/pdf,.pdf"
            onChange={(event) => {
              const file = event.target.files?.[0] ?? null
              setSelectedFile(file)
              setLocalError('')
            }}
          />
        </label>

        <div className="flex gap-2 lg:w-[210px] lg:flex-col xl:flex-row">
          <button
            type="button"
            onClick={onUploadPaper}
            className="inline-flex flex-1 items-center justify-center rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Browse
          </button>
          <button
            type="submit"
            disabled={uploading}
            className="inline-flex flex-1 items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-4 py-3 text-sm font-semibold text-white transition hover:from-indigo-500 hover:to-violet-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </div>
      </form>

      <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
        {localError ? <p className="rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700">{localError}</p> : null}
        {!localError && error ? <p className="rounded-full bg-rose-50 px-3 py-1 text-sm font-medium text-rose-700">{error}</p> : null}
        {!error && message ? <p className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700">{message}</p> : null}
      </div>
    </section>
  )
}
