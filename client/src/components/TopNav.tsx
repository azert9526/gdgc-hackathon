// import React from 'react'

const TopNav = () => (
  <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-background-dark/80 px-8 backdrop-blur-md">
    <div className="flex items-center flex-1">
      <div className="relative w-full max-w-md">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xl">search</span>
        <input className="w-full rounded-lg border-none bg-slate-100 dark:bg-slate-800 pl-10 pr-4 py-2 text-sm text-slate-900 dark:text-white placeholder:text-slate-500 focus:ring-2 focus:ring-primary" placeholder="Search infrastructure, instances..." type="text" />
      </div>
    </div>
    <div className="flex items-center gap-4">
      <button className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><span className="material-symbols-outlined">notifications</span></button>
      <button className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><span className="material-symbols-outlined">help</span></button>
      <div className="h-8 w-px bg-slate-200 dark:bg-slate-700"></div>
      <div className="flex items-center gap-3 pl-2">
        <div className="flex flex-col items-end">
          <span className="text-sm font-semibold text-slate-900 dark:text-white">Alex Rivera</span>
          <span className="text-xs text-slate-500 dark:text-slate-400">Admin Account</span>
        </div>
        <div className="h-10 w-10 rounded-full bg-cover bg-center border-2 border-primary/20" style={{ backgroundImage: 'url(https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=80&q=80)' }} />
      </div>
    </div>
  </header>
)

export default TopNav
