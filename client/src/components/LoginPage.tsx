interface LoginPageProps {
  onSignIn: () => void
  onRegister: () => void
  theme: 'light' | 'dark'
  onToggleTheme: () => void
}

const LoginPage = ({ onSignIn, onRegister, theme, onToggleTheme }: LoginPageProps) => {

  const handleGoogleLogin = () => {
    // Redirects the browser to your Python backend's OAuth trigger
    window.location.href = '/oauth-login'; 
  };

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark font-display text-slate-900 dark:text-slate-100">
      <div className="flex min-h-screen w-full flex-col lg:flex-row">
        <div className="relative hidden lg:flex lg:w-1/2 flex-col justify-center items-center bg-primary/10 overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-40 bg-cover bg-center" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuB8QwxC1_IzLEzAU6qCtchHmz-xziXdN2boYKODC31qM_nlJw45x3zFDLru2lHcZI_TDyLg03s42eKIILqtTWNzrcuykAV_WfXSnrUKFTd9Vx0Nwt9cYMI4DflURXZ-zKHgWDq77xk75eXBtbs062z6ac_NuEZKuxGYppzTd3yZH3nPQemBkqs21V6TqftKwWkiGXhM-mILbdsZc3oY52Jb-R1dofQIVPm5cRwjfcLgRG4LsaprERwKWuJEjPikr7szMJ_85pksOTLN')" }}></div>
          <div className="absolute inset-0 bg-gradient-to-t from-background-dark/80 via-transparent to-transparent z-10"></div>
          <div className="relative z-20 px-12 text-center">
            <div className="mb-8 inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary text-white shadow-2xl shadow-primary/40">
              <span className="material-symbols-outlined !text-4xl">cloud_queue</span>
            </div>
            <h1 className="text-5xl font-black tracking-tight text-white mb-6">Welcome to <br /><span className="text-primary">PIIGhost</span></h1>
            <p className="text-slate-300 text-lg max-w-md mx-auto leading-relaxed">Experience the next generation of cloud computing. Secure, scalable, and lightning fast infrastructure for modern developers.</p>
          </div>
          <div className="absolute bottom-10 left-10 z-20 flex items-center gap-4">
            <div className="flex -space-x-3">
              <div className="w-10 h-10 rounded-full border-2 border-background-dark bg-slate-400"></div>
              <div className="w-10 h-10 rounded-full border-2 border-background-dark bg-slate-500"></div>
              <div className="w-10 h-10 rounded-full border-2 border-background-dark bg-slate-600"></div>
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-24 bg-background-light dark:bg-background-dark">
          <div className="mx-auto w-full max-w-sm">
            <div className="lg:hidden mb-12 flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg text-white"><span className="material-symbols-outlined">cloud_queue</span></div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-slate-100">PIIGhost</span>
            </div>
            <div className="mb-10 flex items-center justify-between">
              <div>
                <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Sign in</h2>
                <p className="text-slate-500 dark:text-slate-400">Enter your credentials to access your dashboard</p>
              </div>
              <button onClick={onToggleTheme} className="rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
                {theme === 'light' ? 'Dark' : 'Light'}
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 mb-8">
              <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-2.5 px-4 text-sm font-semibold transition hover:bg-slate-50 dark:hover:bg-slate-800" type="button" onClick={handleGoogleLogin}>
                Google
              </button>
              <button className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 py-2.5 px-4 text-sm font-semibold transition hover:bg-slate-50 dark:hover:bg-slate-800" type="button" onClick={handleGoogleLogin}>
                GitHub
              </button>
            </div>
            <div className="relative mb-8">
              <div aria-hidden="true" className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200 dark:border-slate-800"></div></div>
              <div className="relative flex justify-center text-sm font-medium leading-6"><span className="bg-background-light dark:bg-background-dark px-4 text-slate-500">Or continue with</span></div>
            </div>
            <form className="space-y-5" onSubmit={(e) => { e.preventDefault(); onSignIn(); }}>
              <div>
                <label className="block text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100" htmlFor="email">Email Address</label>
                <div className="mt-2">
                  <input id="email" name="email" type="email" autoComplete="email" required className="block w-full rounded-lg border-0 py-3 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary bg-white dark:bg-slate-900/50 sm:text-sm sm:leading-6 pr-10" placeholder="name@company.com" />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between"><label className="block text-sm font-semibold leading-6 text-slate-900 dark:text-slate-100" htmlFor="password">Password</label><a className="font-semibold text-primary hover:text-primary/80" href="#">Forgot password?</a></div>
                <div className="mt-2 relative">
                  <input id="password" name="password" type="password" autoComplete="current-password" required className="block w-full rounded-lg border-0 py-3 text-slate-900 dark:text-white shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-inset focus:ring-primary bg-white dark:bg-slate-900/50 sm:text-sm sm:leading-6 pr-10" placeholder="••••••••" />
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3"><span className="material-symbols-outlined text-slate-400 cursor-pointer hover:text-slate-300 text-[20px]">visibility</span></div>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-2"><input id="remember-me" name="remember-me" type="checkbox" className="h-4 w-4 rounded border-slate-300 dark:border-slate-800 text-primary focus:ring-primary bg-white dark:bg-slate-900" /><label className="text-sm text-slate-600 dark:text-slate-400" htmlFor="remember-me">Remember for 30 days</label></div>
              <div><button type="submit" className="flex w-full justify-center rounded-lg bg-primary px-3 py-3 text-sm font-bold leading-6 text-white shadow-lg shadow-primary/20 hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary transition-all">Sign In</button></div>
            </form>
            <p className="mt-10 text-center text-sm text-slate-500">Don't have an account? <button onClick={onRegister} className="font-semibold leading-6 text-primary hover:text-primary/80">Create an account</button></p>
          </div>
          <div className="mt-auto pt-10 text-center text-xs text-slate-500 flex justify-center gap-6"><a className="hover:underline" href="#">Privacy Policy</a><a className="hover:underline" href="#">Terms of Service</a><a className="hover:underline" href="#">Status</a></div>
        </div>
      </div>
    </div>
  )
}

export default LoginPage
