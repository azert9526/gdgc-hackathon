import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export interface PrivacyModalProps {
  open: boolean
  onClose: () => void
  onSessionCreated?: (serviceLink: string) => void
}

const PrivacyModal = ({ open, onClose, onSessionCreated }: PrivacyModalProps) => {
  const navigate = useNavigate()

  // Dropdown data states
  const [availableProjects, setAvailableProjects] = useState<string[]>([])
  const [availableRegions, setAvailableRegions] = useState<string[]>([])
  const [isLoadingDeps, setIsLoadingDeps] = useState(false)

  // Form states
  const [projectId, setProjectId] = useState('')
  const [region, setRegion] = useState('')
  const [serviceName, setServiceName] = useState('')
  const [allowedIps, setAllowedIps] = useState('0.0.0.0/0')
  
  // --- MODEL SELECTION STATES ---
  const [modelName, setModelName] = useState('google/gemini-2.5-flash')
  const [useOwnKey, setUseOwnKey] = useState(false)
  const [apiKey, setApiKey] = useState('')
  
  // Status states
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  // Fetch projects and regions when modal opens
  useEffect(() => {
    if (!open) return

    const fetchDependencies = async () => {
      setIsLoadingDeps(true)
      try {
        const projRes = await fetch('/projects', { credentials: 'same-origin' })
        const projData = projRes.ok ? await projRes.json() : ['mate-tester-hak']
        setAvailableProjects(projData)
        if (projData.length > 0) setProjectId(projData[0])

        const regRes = await fetch('/regions')
        const regData = regRes.ok ? await regRes.json() : ['europe-west1', 'us-central1']
        setAvailableRegions(regData)
        if (regData.length > 0) setRegion(regData[0])
      } catch (err) {
        console.error("Failed to fetch dropdown data:", err)
      } finally {
        setIsLoadingDeps(false)
      }
    }

    fetchDependencies()
    setStatus('idle')
    setErrorMessage('')
  }, [open])

  if (!open) return null

  const handleDeploy = async () => {
    setStatus('sending')
    setErrorMessage('')

    try {
      const parsedIps = allowedIps
        .split(',')
        .map((ip) => ip.trim())
        .filter(Boolean)

      const cleanServiceName = serviceName.toLowerCase().replace(/[^a-z0-9]/g, '')
      const token = localStorage.getItem('access_token') || '' 

      // --- NEW ENV VAR LOGIC ---
      // MODEL_NAME is always sent. API_KEY is sent only if the user checked the box.
      const envVars: Record<string, string> = {
        MODEL_NAME: modelName,
        API_KEY: useOwnKey ? apiKey : ''
      }

      const body = {
        project_id: projectId,
        region: region,
        service_name: cleanServiceName,
        container_image: "docker.io/bluegalaxy4012/piighost:v6",
        env: envVars,
        allowed_ips: parsedIps,
        access_token: token
      }

      const res = await fetch('/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.detail || data.error || 'Deployment failed')
      }

      onSessionCreated?.(data.service_link)
      setStatus('success')

      if (data.service_link) {
        window.open(data.service_link, '_blank', 'noopener,noreferrer')
      }
      
      setTimeout(() => {
        onClose()
        navigate('/live-services')
      }, 1500)

    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const isDeployDisabled =
    status === 'sending' || 
    isLoadingDeps ||
    !projectId || 
    !region || 
    !serviceName.trim() || 
    (useOwnKey && !apiKey.trim())

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161e27] shadow-2xl max-h-[85vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Deploy Service</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure and launch your container.</p>
          </div>
          <button onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors" aria-label="Close modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
          
          {/* Form Fields: Project & Region */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Project ID</label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                disabled={isLoadingDeps}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c252e] text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-3 outline-none transition-all appearance-none disabled:opacity-50"
              >
                {availableProjects.map((proj) => (
                  <option key={proj} value={proj}>{proj}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                disabled={isLoadingDeps}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c252e] text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-3 outline-none transition-all appearance-none disabled:opacity-50"
              >
                {availableRegions.map((reg) => (
                  <option key={reg} value={reg}>{reg}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Service Name</label>
            <input
              value={serviceName}
              onChange={(e) => setServiceName(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c252e] text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-3 outline-none transition-all"
              placeholder="e.g. testapp12"
              type="text"
            />
            <p className="mt-1 text-xs text-slate-500">Letters and numbers only.</p>
          </div>

          {/* --- MODEL CONFIGURATION SECTION --- */}
          <div className="space-y-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-[#1c252e]/50 p-4">
            
            {/* 1. The Model Dropdown (Always visible) */}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Model Name</label>
              <select
                value={modelName}
                onChange={(e) => setModelName(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c252e] text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-3 outline-none transition-all appearance-none"
              >
                <optgroup label="Google">
                  <option value="google/gemini-2.5-flash">Gemini 2.5 Flash</option>
                  <option value="google/gemini-2.5-pro">Gemini 2.5 Pro</option>
                </optgroup>
                <optgroup label="OpenAI">
                  <option value="openai/gpt-4o">GPT-4o</option>
                  <option value="openai/o1-preview">o1-preview</option>
                </optgroup>
                <optgroup label="Anthropic">
                  <option value="anthropic/claude-3.5-sonnet">Claude 3.5 Sonnet</option>
                  <option value="anthropic/claude-3-opus">Claude 3 Opus</option>
                </optgroup>
                <optgroup label="Meta">
                  <option value="meta-llama/llama-3.1-405b-instruct">Llama 3.1 (405B)</option>
                  <option value="meta-llama/llama-3.1-70b-instruct">Llama 3.1 (70B)</option>
                </optgroup>
              </select>
            </div>

            {/* 2. The API Key Checkbox */}
            <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-slate-700">
              <input
                id="own-key-checkbox"
                type="checkbox"
                checked={useOwnKey}
                onChange={(e) => setUseOwnKey(e.target.checked)}
                className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary bg-white dark:bg-[#1c252e]"
              />
              <label htmlFor="own-key-checkbox" className="text-sm font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                Provide your own API Key
              </label>
            </div>

            {/* 3. The API Key Input (Conditionally rendered) */}
            {useOwnKey && (
              <div className="pt-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">API Key <span className="text-rose-500">*</span></label>
                <input
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c252e] text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-3 outline-none transition-all"
                  placeholder="sk-or-v1-..."
                  type="password"
                  required={useOwnKey}
                />
                <p className="mt-2 text-xs text-slate-500">Your key will be securely passed to the container.</p>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Allowed IPs</label>
            <textarea
              value={allowedIps}
              onChange={(e) => setAllowedIps(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c252e] text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-3 outline-none transition-all resize-none"
              placeholder="193.226.5.157/32, 8.8.8.0/24"
              rows={2}
            />
            <p className="mt-1 text-xs text-slate-500">Separate multiple IPs with commas.</p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-200 dark:border-slate-800 shrink-0 bg-slate-50 dark:bg-[#161e27]">
          <div className="mb-4 text-sm min-h-[1.25rem]">
            {status === 'success' && <span className="text-emerald-600 dark:text-emerald-300 font-medium">✅ Deployment initiated successfully!</span>}
            {status === 'error' && <span className="text-rose-600 dark:text-rose-300 font-medium">⚠️ {errorMessage}</span>}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-end">
            <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
              Cancel
            </button>
            <button
              disabled={isDeployDisabled}
              onClick={handleDeploy}
              className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-white font-bold transition-all ${isDeployDisabled ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'}`}
            >
              {status === 'sending' ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-sm">progress_activity</span>
                  Deploying...
                </>
              ) : 'Deploy'}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}

export default PrivacyModal 