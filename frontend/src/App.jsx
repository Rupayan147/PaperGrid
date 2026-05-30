import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import TopNav from './components/TopNav.jsx'
import HeroSection from './components/HeroSection.jsx'
import Toast from './components/Toast.jsx'
import UploadPaper from './components/UploadPaper.jsx'
import StatsCards from './components/StatsCards.jsx'
import PaperTable from './components/PaperTable.jsx'
import EditPaperModal from './components/EditPaperModal.jsx'
import PaperDetailDrawer from './components/PaperDetailDrawer.jsx'

const API_BASE_URL = 'http://localhost:8000'

function App() {
  const [papers, setPapers] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)
  const [editingPaper, setEditingPaper] = useState(null)
  const [selectedPaper, setSelectedPaper] = useState(null)

  const loadPapers = useCallback(async () => {
    setLoading(true)
    setError('')

    try {
      const response = await axios.get(`${API_BASE_URL}/papers`)
      setPapers(response.data)
    } catch {
      setError('Unable to load papers from the backend.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    const timerId = window.setTimeout(() => {
      void loadPapers()
    }, 0)

    return () => window.clearTimeout(timerId)
  }, [loadPapers])

  const handleUpload = async (file) => {
    setUploading(true)
    setError('')
    setMessage('')
    setToast(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      setPapers((current) => [response.data, ...current])
      setMessage('Paper uploaded and saved successfully.')
      setToast({
        type: 'success',
        title: 'Upload complete',
        description: 'Paper extracted and saved to SQLite.',
      })
    } catch (requestError) {
      const responseMessage = requestError.response?.data?.detail ?? 'Upload failed.'
      setError(responseMessage)
      setToast({
        type: 'error',
        title: 'Upload failed',
        description: responseMessage,
      })
    } finally {
      setUploading(false)
    }
  }

  const handleSavePaper = async (paperId, updates) => {
    setError('')
    setMessage('')
    setToast(null)

    try {
      const response = await axios.put(`${API_BASE_URL}/papers/${paperId}`, updates)
      setPapers((current) => current.map((paper) => (paper.id === paperId ? response.data : paper)))
      setEditingPaper(null)
      setMessage('Paper updated successfully.')
      setToast({
        type: 'success',
        title: 'Changes saved',
        description: 'Paper details were updated.',
      })
    } catch (requestError) {
      const responseMessage = requestError.response?.data?.detail ?? 'Update failed.'
      setError(responseMessage)
      setToast({
        type: 'error',
        title: 'Update failed',
        description: responseMessage,
      })
    }
  }

  const handleDeletePaper = async (paperId) => {
    const shouldDelete = window.confirm('Delete this paper from the survey table?')
    if (!shouldDelete) {
      return
    }

    setError('')
    setMessage('')
    setToast(null)

    try {
      await axios.delete(`${API_BASE_URL}/papers/${paperId}`)
      setPapers((current) => current.filter((paper) => paper.id !== paperId))
      setMessage('Paper deleted successfully.')
      setToast({
        type: 'success',
        title: 'Deleted',
        description: 'Paper removed from the survey table.',
      })
    } catch (requestError) {
      const responseMessage = requestError.response?.data?.detail ?? 'Delete failed.'
      setError(responseMessage)
      setToast({
        type: 'error',
        title: 'Delete failed',
        description: responseMessage,
      })
    }
  }

  const handleRefresh = async () => {
    await loadPapers()
  }

  const filteredPapers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase()
    if (!query) {
      return papers
    }

    return papers.filter((paper) => {
      const searchableFields = [paper.title, paper.year, paper.method, paper.dataset, paper.authors]
      return searchableFields.some((value) => value?.toLowerCase().includes(query))
    })
  }, [papers, searchTerm])

  const stats = useMemo(() => {
    const methods = new Set()
    const datasets = new Set()
    const metrics = new Set()

    for (const paper of papers) {
      if (paper.method?.trim()) {
        methods.add(paper.method.trim())
      }
      if (paper.dataset?.trim()) {
        datasets.add(paper.dataset.trim())
      }
      if (paper.metrics?.trim()) {
        metrics.add(paper.metrics.trim())
      }
    }

    return {
      totalPapers: papers.length,
      methodsFound: methods.size,
      datasetsFound: datasets.size,
      metricsFound: metrics.size,
    }
  }, [papers])

  const heroStats = useMemo(
    () => [
      {
        label: 'Papers Indexed',
        value: papers.length,
        accent: 'from-indigo-600 to-violet-600',
      },
      {
        label: 'Methods Detected',
        value: stats.methodsFound,
        accent: 'from-cyan-500 to-blue-600',
      },
      {
        label: 'Export Ready',
        value: papers.length > 0 ? 'Yes' : 'No',
        accent: 'from-slate-700 to-slate-500',
      },
    ],
    [papers.length, stats.methodsFound],
  )

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F8FAFC] text-slate-900">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-[-120px] top-[-110px] h-[360px] w-[360px] rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="absolute right-[-120px] top-[100px] h-[340px] w-[340px] rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute bottom-[-140px] left-[28%] h-[380px] w-[380px] rounded-full bg-violet-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto w-full max-w-[1440px] px-4 py-4 sm:px-4 lg:px-6 lg:py-5">
        <TopNav onRefresh={handleRefresh} />

        <main className="mt-4 space-y-3 lg:mt-4 lg:space-y-4">
          <HeroSection heroStats={heroStats} />

          <StatsCards {...stats} />

          <UploadPaper
            onUpload={handleUpload}
            uploading={uploading}
            message={message}
            error={error}
            onUploadPaper={() => document.getElementById('upload-strip')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
          />

          <PaperTable
            papers={filteredPapers}
            loading={loading}
            onEdit={setEditingPaper}
            onDelete={handleDeletePaper}
            onView={setSelectedPaper}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            onRefresh={handleRefresh}
          />
        </main>

        <EditPaperModal
          key={editingPaper?.id ?? 'closed'}
          paper={editingPaper}
          onClose={() => setEditingPaper(null)}
          onSave={handleSavePaper}
        />

        <PaperDetailDrawer
          paper={selectedPaper}
          onClose={() => setSelectedPaper(null)}
          onEdit={(paper) => {
            setSelectedPaper(null)
            setEditingPaper(paper)
          }}
        />

        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </div>
  )
}

export default App
