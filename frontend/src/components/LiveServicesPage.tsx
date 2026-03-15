import Sidebar from './Sidebar'
import { useState, useEffect } from 'react'

interface LiveServicesPageProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onDashboardBack: () => void
  // onOpenChatSession: (serviceLink: string) => void
}

interface Deployment {
  id: string | number
  project_id: string
  service_link: string
  created_at: string
}

const LiveServicesPage = ({ theme, onToggleTheme, onDashboardBack }: LiveServicesPageProps) => {
  const [deployments, setDeployments] = useState<Deployment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchDeployments = async () => {
      try {
        const res = await fetch('/my-deployments', { credentials: 'same-origin' })
        if (res.ok) {
          const data = await res.json()
          setDeployments(data)
        }
      } catch (err) {
        console.error("Failed to fetch deployments:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDeployments()
  }, [])

  // Helper to make URLs look cuter/shorter in the UI
  const formatUrl = (url: string) => {
    return url.replace(/^https?:\/\//, '').replace(/\/$/, '')
  }

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="p-8">
          
          <div className="mb-4 flex items-center justify-between">
            <button onClick={onDashboardBack} className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">← Back</button>
            <button onClick={onToggleTheme} className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Live Services</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl">Manage your active real-time services and monitor their usage in a unified view.</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <span className="material-symbols-outlined animate-spin text-primary text-4xl">progress_activity</span>
            </div>
          ) : deployments.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 p-12 text-center">
              <span className="material-symbols-outlined text-4xl text-slate-400 mb-3">cloud_off</span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No active services</h3>
              <p className="text-slate-500 mt-1">Deploy a new privacy container from the dashboard to see it here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
              {deployments.map((dep) => (
                <div key={dep.id} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm flex flex-col">
                  
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-4 mb-4 border-b border-slate-100 dark:border-slate-800/50 pb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                        <span className="material-symbols-outlined">rocket_launch</span>
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Privacy Container</h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Deployed in {dep.project_id}</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-200 dark:border-emerald-800/50">
                      Active
                    </span>
                  </div>

                  {/* Card Body - Links */}
                  <div className="space-y-3 mb-6 flex-1">
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Service URL</span>
                      <a href={dep.service_link} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline group break-all">
                        {formatUrl(dep.service_link)}
                        <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                      </a>
                    </div>
                    
                    <div>
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Google Cloud Project</span>
                      <a href={`https://console.cloud.google.com/welcome?project=${dep.project_id}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-primary dark:hover:text-primary transition-colors group">
                        <span className="material-symbols-outlined text-[18px]">cloud</span>
                        {dep.project_id}
                        <span className="material-symbols-outlined text-[16px] opacity-0 group-hover:opacity-100 transition-opacity">open_in_new</span>
                      </a>
                    </div>
                  </div>

                  {/* Card Footer - Actions - review */}
                  <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800/50 flex justify-end">
                    <a 
                      href={dep.service_link} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all"
                    >
                      <span className="material-symbols-outlined text-[18px]">chat</span>
                      Open Chat
                    </a>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default LiveServicesPage