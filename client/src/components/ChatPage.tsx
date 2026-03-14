import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

interface ChatPageProps {
  theme: 'light' | 'dark'
  onToggleTheme: () => void
  sessionKey: string
}

interface Message {
  role: 'user' | 'assistant'
  text: string
  time: string
}

const ChatPage = ({ theme, onToggleTheme, sessionKey }: ChatPageProps) => {
  const storageKey = `privacy-chat-${sessionKey}`

  const createInitialMessages = (): Message[] => {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Message[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed
        }
      } catch {
      }
    }
    return []
  }

  const [messages, setMessages] = useState<Message[]>(createInitialMessages)
  const [input, setInput] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem(storageKey)
    if (raw) {
      try {
        const parsed = JSON.parse(raw) as Message[]
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed)
          return
        }
      } catch {
      }
    }
    setMessages([])
  }, [storageKey])

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(messages))
  }, [messages, storageKey])

  const sendMessage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return

    const userMessage: Message = { role: 'user', text, time: new Date().toLocaleTimeString() }
    const assistantMessage: Message = { role: 'assistant', text: `Got it. I logged your message: "${text}"`, time: new Date().toLocaleTimeString() }

    setMessages((prev) => [...prev, userMessage, assistantMessage])
    setInput('')
  }


  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark text-slate-900 dark:text-slate-100 font-display">
      <header className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 px-6 py-3 bg-white dark:bg-slate-900 sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center bg-primary rounded-lg p-1.5 text-white"><span className="material-symbols-outlined text-xl">shield_person</span></div>
          <div>
            <h2 className="font-bold text-slate-900 dark:text-white">Privacy Guard</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Analysis & Chat</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={onToggleTheme} className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1 text-xs">{theme === 'light' ? 'Dark' : 'Light'}</button>
          <Link to="/live-services" className="rounded-lg border border-slate-300 dark:border-slate-700 px-3 py-1 text-xs">← Back</Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-4xl p-4 grid gap-4">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div className="flex items-center gap-2 text-primary"><span className="material-symbols-outlined">check_circle</span><span className="text-sm font-semibold uppercase tracking-wider">Analysis Complete</span></div>
            <span className="text-xs text-slate-500 dark:text-slate-400">4 flags</span>
          </div>
          <h1 className="text-2xl font-bold">Risk Assessment Results</h1>
          <p className="mt-1 text-slate-500 dark:text-slate-400 text-sm">We've identified potential privacy risks in your last prompt.</p>
          <div className="mt-4 flex gap-2 border-b border-slate-200 dark:border-slate-800">
            <button className="px-3 py-2 text-sm font-bold border-b-2 border-primary text-primary">Side-by-Side View</button>
            <button className="px-3 py-2 text-sm text-slate-500 dark:text-slate-400">Risk Summary</button>
          </div>
        </div>


        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs uppercase tracking-wider text-slate-500">Chat with model</div>
            <button className="rounded-full bg-primary text-white text-xs px-2 py-1">Live</button>
          </div>
          <div className="min-h-[200px] border rounded-xl border-slate-200 dark:border-slate-800 p-3 bg-slate-50 dark:bg-slate-800 max-h-[260px] overflow-y-auto">
            {messages.map((msg, idx) => (
              <div key={`${msg.role}-${idx}`} className={`mb-2 rounded-lg p-2 ${msg.role === 'user' ? 'bg-primary/10 text-slate-900 dark:text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100'}`}>
                <div className="text-[11px] uppercase tracking-widest font-semibold">{msg.role}</div>
                <div className="text-sm mt-1">{msg.text}</div>
                <div className="text-[11px] mt-1 text-slate-500 dark:text-slate-300">{msg.time}</div>
              </div>
            ))}
          </div>
          <form onSubmit={sendMessage} className="mt-3 flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} className="flex-1 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-2 text-sm text-slate-900 dark:text-white" placeholder="Type your message..." />
            <button type="submit" className="rounded-lg bg-primary px-3 py-2 text-sm font-semibold text-white">Send</button>
          </form>
        </div>
      </main>
    </div>
  )
}

export default ChatPage
