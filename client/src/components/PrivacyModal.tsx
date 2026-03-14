import { useState } from 'react'

export interface PrivacyModalProps {
  open: boolean
  onClose: () => void
  serviceName: string
  onSessionCreated?: (id: string) => void
}

const PrivacyModal = ({ open, onClose, serviceName, onSessionCreated }: PrivacyModalProps) => {
  const [projectId, setProjectId] = useState('mate-tester-hak')
  const [region, setRegion] = useState('europe-west1')
  const [serviceNameField, setServiceNameField] = useState(serviceName || 'test-app')
  const [provider, setProvider] = useState('chatgpt')
  const [allowedIpsEntries, setAllowedIpsEntries] = useState<Array<{ ip: string; enabled: boolean }>>([
    { ip: '193.226.5.157/32', enabled: true },
  ])
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  if (!open) return null

  const sendConfig = async () => {
    setStatus('sending')
    setErrorMessage('')

    try {
      const body = {
        project_id: projectId,
        region,
        service_name: serviceNameField,
        env: { MODEL_PROVIDER: provider },
        allowed_ips: allowedIpsEntries.filter((a) => a.enabled).map((a) => a.ip).filter(Boolean),
      }

      const res = await fetch('/api/create-instance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const text = await res.text()
        throw new Error(text || 'Request failed')
      }

      const sessionKey = `${serviceNameField.replace(/\s+/g, '-').toLowerCase() || 'session'}`
      onSessionCreated?.(sessionKey)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const isSendDisabled =
    status === 'sending' || !projectId.trim() || !region.trim() || !serviceNameField.trim() 

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161e27] shadow-2xl max-h-[85vh] overflow-hidden">
        <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Configure Service Deployment</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Build the JSON configuration for deploying {serviceName}.</p>
          </div>
          <button onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors" aria-label="Close modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="h-[calc(85vh-140px)] overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Project ID</label>
            <input
              value={projectId}
              onChange={(e) => setProjectId(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c252e] text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-3 outline-none transition-all"
              placeholder="project-id"
              type="text"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Region</label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c252e] text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-3 outline-none transition-all appearance-none"
              >
                <option value="europe-west1">europe-west1</option>
                <option value="us-central1">us-central1</option>
                <option value="asia-northeast1">asia-northeast1</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Service Name</label>
              <input
                value={serviceNameField}
                onChange={(e) => setServiceNameField(e.target.value)}
                className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c252e] text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-3 outline-none transition-all"
                placeholder="service-name"
                type="text"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Model Provider</label>
            <select
              value={provider}
              onChange={(e) => setProvider(e.target.value)}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c252e] text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-3 outline-none transition-all appearance-none"
            >
              <option value="chatgpt">ChatGPT</option>
              <option value="gemini">Gemini</option>
              <option value="claude">Claude</option>
              <option value="bard">Bard</option>
            </select>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">Select a provider (no API key required here).</p>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">Allowed IPs</label>
              <button onClick={() => setAllowedIpsEntries((a) => [...a, { ip: '', enabled: true }])} className="text-sm text-primary hover:underline">
                Add
              </button>
            </div>

            <div className="space-y-2">
              {allowedIpsEntries.map((entry, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input
                    value={entry.ip}
                    onChange={(e) => setAllowedIpsEntries((old) => old.map((v, i) => (i === idx ? { ...v, ip: e.target.value } : v)))}
                    placeholder="193.226.5.157/32"
                    className="flex-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c252e] px-3 py-2"
                  />
                  <label className="flex items-center gap-2 text-sm">
                    <input type="checkbox" checked={entry.enabled} onChange={(e) => setAllowedIpsEntries((old) => old.map((v, i) => (i === idx ? { ...v, enabled: e.target.checked } : v)))} />
                    <span className="text-slate-600 dark:text-slate-300">Allow</span>
                  </label>
                  <button onClick={() => setAllowedIpsEntries((old) => old.filter((_, i) => i !== idx))} className="px-3 rounded-md text-slate-600 dark:text-slate-300">
                    Remove
                  </button>
                </div>
              ))}
            </div>

            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">Toggle to include an IP in the final config.</p>
          </div>

          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="mb-2 text-sm min-h-[1.25rem]">
              {status === 'success' && <span className="text-emerald-600 dark:text-emerald-300">✅ Configuration sent successfully.</span>}
              {status === 'error' && <span className="text-rose-600 dark:text-rose-300">⚠️ {errorMessage || 'Failed to send configuration.'}</span>}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                Cancel
              </button>
              <button
                disabled={isSendDisabled}
                onClick={sendConfig}
                className={`px-6 py-2.5 rounded-lg text-white font-semibold transition-all ${isSendDisabled ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'}`}
              >
                {status === 'sending' ? 'Sending...' : 'Send Configuration'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrivacyModal
