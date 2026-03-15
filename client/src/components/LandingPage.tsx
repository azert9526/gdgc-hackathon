import { useNavigate } from 'react-router-dom'

interface LandingPageProps {
  onDashboardClick: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

const LandingPage = ({ onDashboardClick, theme, onToggleTheme }: LandingPageProps) => {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
              <span className="material-symbols-outlined">cloud</span>
            </div>
            <span className="text-lg font-bold">PIIGhost</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={onToggleTheme} className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">{theme === 'light' ? 'Dark' : 'Light'}</button>
            <button onClick={() => navigate('/login')} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90">Sign In</button>
          </div>
        </header>

        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              New: Global Edge Engine v2.0
            </div>

            <h1 className="mt-6 text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Privacy-first LLMs for the enterprise — <span className="text-primary">secure, local, and fast</span>
            </h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300 text-lg max-w-2xl">PIIGhost runs private LLM containers that keep your sensitive data on-premise while delivering fast, reliable inference for production workloads.</p>

            <div className="mt-8 flex flex-wrap gap-4">
              <button onClick={onDashboardClick} className="bg-primary text-white px-6 py-3 rounded-lg text-sm font-bold shadow-lg hover:bg-primary/90">Get started</button>
              <button onClick={() => navigate('/live-services')} className="border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-5 py-3 rounded-lg text-sm font-semibold hover:bg-slate-100 dark:hover:bg-slate-800">Explore services</button>
            </div>
          </div>

          <div className="hidden lg:flex items-center justify-center">
            <div className="w-full max-w-md rounded-2xl bg-gradient-to-tr from-white/60 to-white/30 dark:from-slate-900/60 dark:to-slate-900/30 border border-slate-200 dark:border-slate-800 p-8 shadow-xl">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Private LLM Container</h3>
              <p className="mt-2 text-slate-600 dark:text-slate-300">Run an encrypted, isolated LLM instance in your environment with audit logs and access controls.</p>
              <div className="mt-6 grid grid-cols-1 gap-3">
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">security</span>
                  <div>
                    <div className="font-semibold">Data stays on-premise</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">No external transfer of sensitive inputs or outputs.</div>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-primary">bolt</span>
                  <div>
                    <div className="font-semibold">Low-latency inference</div>
                    <div className="text-sm text-slate-500 dark:text-slate-400">Optimized for throughput and responsiveness.</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-12 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-center">
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">Compliance</h4>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">GDPR & SOC friendly deployment patterns.</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-center">
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">Scalability</h4>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Autoscale containers to match demand.</p>
          </div>
          <div className="rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 text-center">
            <h4 className="text-xl font-bold text-slate-900 dark:text-white">Security</h4>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">End-to-end encryption and RBAC.</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export default LandingPage
