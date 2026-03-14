import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import Sidebar from './components/Sidebar'
import LandingPage from './components/LandingPage'
import LoginPage from './components/LoginPage'
import RegisterPage from './components/RegisterPage'
import PrivacyServiceCard from './components/PrivacyServiceCard'
import PrivacyModal from './components/PrivacyModal'
import LiveServicesPage from './components/LiveServicesPage'
import ChatPage from './components/ChatPage'

const Dashboard = ({ onMainPage, theme, onToggleTheme, onCreateSession }: { onMainPage: () => void; theme: 'light' | 'dark'; onToggleTheme: () => void; onCreateSession: (id: string) => void }) => {
  const [showModal, setShowModal] = useState(false)
  const [serviceName, setServiceName] = useState('Privacy LLM Container')

  const openModal = (service: string) => {
    setServiceName(service)
    setShowModal(true)
  }

  const closeModal = () => setShowModal(false)

  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <Sidebar />
      <main className="flex flex-1 flex-col overflow-y-auto">
        <div className="p-8">
          <div className="mb-4 flex items-center justify-between">
            <button onClick={onMainPage} className="text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-primary transition-colors">← Back to main page</button>
            <button onClick={onToggleTheme} className="rounded-full border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800">
              {theme === 'light' ? 'Dark' : 'Light'}
            </button>
          </div>
          <div className="mb-8">
            <h1 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Privacy LLM Service</h1>
            <p className="mt-2 text-slate-500 dark:text-slate-400 max-w-2xl">Run your encrypted local LLM container for sensitive data processing with privacy-first inference.</p>
          </div>
          <div className="mb-8 border-b border-slate-200 dark:border-slate-800">
            <div className="flex gap-4"><button className="border-b-2 border-primary pb-4 text-sm font-bold text-primary">Privacy LLM</button></div>
          </div>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-1 lg:grid-cols-1 xl:grid-cols-1">
            <PrivacyServiceCard
              title="Privacy LLM Container"
              desc="Secure local LLM container that encrypts data and processes privacy-sensitive requests in your environment."
              price="Enterprise tier"
              onOpen={() => openModal('Privacy LLM Container')}
            />
          </div>
          <div className="mt-12 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div><h2 className="text-xl font-bold text-slate-900 dark:text-white">Active Resources Usage</h2><p className="text-sm text-slate-500 dark:text-slate-400">Monthly estimated spend: <span className="font-bold text-slate-900 dark:text-slate-100">$142.50</span></p></div>
              <div className="flex flex-wrap gap-4">
                <div className="flex flex-col border-l-2 border-primary pl-4"><span className="text-xs font-bold text-slate-400 uppercase">CPU Core Hours</span><span className="text-lg font-bold">1,240 / 5,000</span></div>
                <div className="flex flex-col border-l-2 border-emerald-500 pl-4"><span className="text-xs font-bold text-slate-400 uppercase">Memory GB/h</span><span className="text-lg font-bold">4,800 / 10,000</span></div>
                <div className="flex flex-col border-l-2 border-amber-500 pl-4"><span className="text-xs font-bold text-slate-400 uppercase">Storage Outbound</span><span className="text-lg font-bold">45.2 GB / 500 GB</span></div>
              </div>
            </div>
          </div>
        </div>
      </main>
<PrivacyModal open={showModal} onClose={closeModal} serviceName={serviceName} onSessionCreated={(id) => onCreateSession(id)} />
    </div>
  )
}

const App = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const [chatSessionKey, setChatSessionKey] = useState('default-session')

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  const toggleTheme = () => setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))

  const LoginRoute = () => {
    const navigate = useNavigate()
    return <LoginPage onSignIn={() => navigate('/mainpage')} onRegister={() => navigate('/register')} theme={theme} onToggleTheme={toggleTheme} />
  }

  const RegisterRoute = () => {
    const navigate = useNavigate()
    return <RegisterPage onSignUp={() => navigate('/login')} onGoToLogin={() => navigate('/login')} theme={theme} onToggleTheme={toggleTheme} />
  }

  const MainpageRoute = () => {
    const navigate = useNavigate()
    return <LandingPage onDashboardClick={() => navigate('/dashboard')} theme={theme} onToggleTheme={toggleTheme} />
  }

  const DashboardRoute = () => {
    const navigate = useNavigate()
    return <Dashboard onMainPage={() => navigate('/mainpage')} theme={theme} onToggleTheme={toggleTheme} onCreateSession={setChatSessionKey} />
  }

  const LiveServicesRoute = () => {
    const navigate = useNavigate()
    const openChatSession = (serviceName: string) => {
      const key = serviceName.replace(/\s+/g, '-').toLowerCase()
      setChatSessionKey(key)
      navigate('/chat')
    }

    return <LiveServicesPage theme={theme} onToggleTheme={toggleTheme} onDashboardBack={() => navigate('/dashboard')} onOpenChatSession={openChatSession} />
  }

  const ChatRoute = () => {
    return <ChatPage theme={theme} onToggleTheme={toggleTheme} sessionKey={chatSessionKey} />
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/register" element={<RegisterRoute />} />
        <Route path="/mainpage" element={<MainpageRoute />} />
        <Route path="/dashboard" element={<DashboardRoute />} />
        <Route path="/live-services" element={<LiveServicesRoute />} />
        <Route path="/chat" element={<ChatRoute />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
