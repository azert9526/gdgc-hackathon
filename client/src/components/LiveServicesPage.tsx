import Sidebar from './Sidebar'
import { useState } from 'react'
import UpdateModal from './UpdateModal'
import type { ServiceConfig } from './UpdateModal'

interface LiveServicesPageProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  onDashboardBack: () => void
  onOpenChatSession: (serviceName: string) => void
}

const services = [
  { title: 'Live Inference API', desc: 'Real-time model inference with low latency endpoints.', price: 'Included' },
  { title: 'Streaming Analytics', desc: 'Monitor and analyze live event data with dashboards.', price: 'Included' },
  { title: 'Auto Scaling Pod', desc: 'Serverless scaling for live traffic spikes.', price: 'Included' },
]

const LiveServicesPage = ({ theme, onToggleTheme, onDashboardBack, onOpenChatSession }: LiveServicesPageProps) => {
  const [selectedService, setSelectedService] = useState<string | null>(null)
  const [openUpdate, setOpenUpdate] = useState(false)
  const [configs, setConfigs] = useState<Record<string, ServiceConfig>>({})

  const handleOpenMetrics = (title: string) => {
    setSelectedService(title)
    setOpenUpdate(true)
  }

  const handleSaveConfig = (cfg: ServiceConfig) => {
    if (!selectedService) return
    setConfigs((s) => ({ ...s, [selectedService]: cfg }))
  }

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="p-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <button onClick={onDashboardBack} className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">← Back</button>
            </div>
            <button onClick={onToggleTheme} className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          </div>
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Live Services</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl">Manage your active real-time services and monitor their usage in a unified view.</p>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {services.map((service) => (
              <div key={service.title} className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">{service.title}</h2>
                    <p className="mt-2 text-slate-500 dark:text-slate-300 text-sm">{service.desc}</p>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-300">{service.price}</span>
                </div>
                <div className="mt-4 flex gap-2">
                  <button onClick={() => onOpenChatSession(service.title)} className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white hover:bg-primary/90">Chat</button>
                  <button onClick={() => handleOpenMetrics(service.title)} className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">Metrics</button>
                </div>
              </div>
            ))}
          </div>
          <UpdateModal
            open={openUpdate}
            onClose={() => setOpenUpdate(false)}
            initial={selectedService ? configs[selectedService] : undefined}
            onSave={handleSaveConfig}
          />
        </div>
      </main>
    </div>
  )
}

export default LiveServicesPage
