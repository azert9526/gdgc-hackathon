interface RegisterPageProps {
  onSignUp: () => void
  onGoToLogin: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

const RegisterPage = ({ onSignUp, onGoToLogin, theme, onToggleTheme }: RegisterPageProps) => {
  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100">
      <div className="flex min-h-screen">
        <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-primary/10">
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuAe2mh23wPfIerDB2z8BraIPYGwWbvf0lRkJXbmJ7IlejZnIPq6PYRN5ci7zq_Gqg_Twhihmp0r2BsNpayjIdp-DtxP3e_2ZcSEApILSmcIM03EUjWjm-tWS97z4Je4lZzZpllqn0mc9Dv3dMOOJYk6r0WrhvH632ylp-_tQN1-K6FXXoNvLIXpliUFcWbZ53_e7HHHhhaE7lJOzG37dw0tQFBFaODLmwRRurS7SdHpImm8JqXZEWdM_R4PXKxYg5VymM1Rqp6pUV_F')" }}>
            <div className="absolute inset-0 bg-gradient-to-tr from-background-dark via-background-dark/60 to-transparent"></div>
          </div>
          <div className="relative z-10 flex flex-col justify-between p-16 w-full">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary flex items-center justify-center rounded-lg"><span className="material-symbols-outlined text-white text-2xl">cloud</span></div>
              <h1 className="text-2xl font-bold tracking-tight text-white">PIIGhost</h1>
            </div>
            <div className="max-w-md">
              <h2 className="text-4xl font-black text-white leading-tight mb-6">Scale your vision to new heights.</h2>
              <p className="text-lg text-slate-300 leading-relaxed mb-8">"PIIGhost has revolutionized our deployment pipeline. We went from weekly releases to daily updates within a month."</p>
              <div className="flex items-center gap-4">
              </div>
            </div>
            <div className="flex gap-4 text-slate-400 text-sm"><span>© 2024 PIIGhost Inc.</span><a className="hover:text-primary" href="#">Terms</a><a className="hover:text-primary" href="#">Privacy</a></div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 flex items-center justify-center p-8 sm:p-12 lg:p-24 bg-background-light dark:bg-background-dark">
          <div className="w-full max-w-[440px] flex flex-col gap-8">
            <div className="flex items-center justify-between">
              <div className="lg:hidden flex items-center gap-3 mb-4"><div className="w-8 h-8 bg-primary flex items-center justify-center rounded-lg"><span className="material-symbols-outlined text-white text-xl">cloud</span></div><h1 className="text-xl font-bold tracking-tight dark:text-white">PIIGhost</h1></div>
              <button onClick={onToggleTheme} className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                {theme === 'light' ? 'Dark' : 'Light'}
              </button>
            </div>
            <div className="flex flex-col gap-2"><h2 className="text-3xl font-bold tracking-tight dark:text-white">Get started</h2><p className="text-slate-600 dark:text-slate-400">Join over 10,000 developers building the future.</p></div>
            <div className="flex flex-col gap-4">
              <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 py-3 px-4 text-sm font-semibold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"><span className="dark:text-white">Sign up with Google</span></button>
              <button className="flex w-full items-center justify-center gap-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 py-3 px-4 text-sm font-semibold transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"><span className="material-symbols-outlined text-slate-900 dark:text-white">terminal</span><span className="dark:text-white">Sign up with GitHub</span></button>
            </div>
            <div className="relative"><div aria-hidden="true" className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-300 dark:border-slate-700"></div></div><div className="relative flex justify-center text-sm"><span className="bg-background-light dark:bg-background-dark px-2 text-slate-500">Or continue with email</span></div></div>
            <form className="flex flex-col gap-5" onSubmit={(e) => { e.preventDefault(); onSignUp(); }}>
              <div className="flex flex-col gap-2"><label className="text-sm font-medium dark:text-slate-200">Full Name</label><input className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="John Doe" type="text" required /></div>
              <div className="flex flex-col gap-2"><label className="text-sm font-medium dark:text-slate-200">Work Email</label><input className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="name@company.com" type="email" required /></div>
              <div className="flex flex-col gap-2"><label className="text-sm font-medium dark:text-slate-200">Password</label><input className="block w-full rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800/50 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-500 focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all" placeholder="••••••••" type="password" required /><p className="text-[11px] text-slate-500 mt-1">Must be at least 8 characters long.</p></div>
              <button className="w-full rounded-lg bg-primary py-3.5 text-sm font-bold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-[0.98]" type="submit">Create Account</button>
            </form>
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">Already have an account? <button onClick={onGoToLogin} className="font-semibold text-primary hover:underline underline-offset-4">Log in instead</button></p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RegisterPage
