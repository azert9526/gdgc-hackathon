import { Link, useLocation } from 'react-router-dom'

const Sidebar = () => {
  const location = useLocation()
  const isActive = (path: string) => location.pathname === path

  return (
    <aside className="flex w-64 flex-col border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-background-dark h-full">
      <div className="flex items-center gap-3 px-6 py-6 border-b border-slate-200 dark:border-slate-800">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
          <span className="material-symbols-outlined text-2xl">cloud</span>
        </div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">PIIGhost</h2>
      </div>
      <nav className="flex-1 space-y-1 px-3 py-6">
        <div className="mb-4 px-3"><p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">Main Menu</p></div>
        <Link to="/dashboard" className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive('/dashboard') ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary'}`}>
          <span className="material-symbols-outlined">dashboard</span>
          Overview
        </Link>
        <Link to="/live-services" className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${isActive('/live-services') ? 'bg-primary/10 text-primary' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-primary'}`}>
          <span className="material-symbols-outlined">widgets</span>
          Live Services
        </Link>
      </nav>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800"></div>
    </aside>
  )
}

export default Sidebar
