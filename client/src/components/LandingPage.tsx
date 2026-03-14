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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold uppercase tracking-wider w-fit">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              New: Global Edge Engine v2.0
            </div>
            <div>
              <button onClick={() => navigate('/login')} className="bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700">Go to Login</button>
            </div>
            <h1 className="mt-4 text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white leading-tight">
              Enterprise-grade infrastructure for <span className="text-primary">modern scaling</span>
            </h1>
            <p className="mt-3 text-slate-600 dark:text-slate-300 text-lg">Deploy, manage, and scale your applications on a global IaaS and CaaS platform built for reliability.</p>
          </div>
          <button onClick={onToggleTheme} className="mb-2 rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 transition hover:bg-slate-100 dark:hover:bg-slate-800">
            {theme === 'light' ? 'Dark' : 'Light'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Ready to launch your app?</h2>
            <p className="mt-2 text-slate-600 dark:text-slate-300">Build with a secure privacy-first dashboard and single-click deployment.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button onClick={onDashboardClick} className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-primary/90">Go to Dashboard</button>
              <button className="border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 dark:hover:bg-slate-800">View Docs</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default LandingPage
