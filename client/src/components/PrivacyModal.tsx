import { useState } from 'react'

export interface PrivacyModalProps {
  open: boolean
  onClose: () => void
  serviceName: string
  onSessionCreated?: (id: string) => void
}

const PrivacyModal = ({ open, onClose, serviceName, onSessionCreated }: PrivacyModalProps) => {
  const [instanceName, setInstanceName] = useState('')
  const [region, setRegion] = useState('US East (N. Virginia)')
  const [os, setOs] = useState('Ubuntu 22.04 LTS')
  const [instanceType, setInstanceType] = useState('small')
  const [sshKey, setSshKey] = useState('')
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  if (!open) return null

  const sendConfig = async () => {
    setStatus('sending')
    setErrorMessage('')

    try {
      const body = {
        serviceName,
        instanceName,
        region,
        os,
        instanceType,
        sshKey,
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

      const sessionKey = `${instanceName.replace(/\s+/g, '-').toLowerCase() || 'session'}`
      onSessionCreated?.(sessionKey)
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrorMessage(err instanceof Error ? err.message : 'Unknown error')
    }
  }

  const isSendDisabled = status === 'sending' || !instanceName.trim() || !sshKey.trim()

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161e27] shadow-2xl max-h-[85vh] overflow-hidden">
        <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Create Compute Instance</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Configure your new high-performance virtual machine for {serviceName}.</p>
          </div>
          <button onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors" aria-label="Close modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="h-[calc(85vh-140px)] overflow-y-auto p-6 space-y-6 custom-scrollbar">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Instance Name</label>
            <input value={instanceName} onChange={(e) => setInstanceName(e.target.value)} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c252e] text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-3 outline-none transition-all" placeholder="e.g. production-web-server-01" type="text" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Region</label>
              <select value={region} onChange={(e) => setRegion(e.target.value)} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c252e] text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-3 outline-none transition-all appearance-none">
                <option>US East (N. Virginia)</option>
                <option>EU West (Ireland)</option>
                <option>Asia Pacific (Tokyo)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Operating System</label>
              <select value={os} onChange={(e) => setOs(e.target.value)} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c252e] text-slate-900 dark:text-white focus:ring-primary focus:border-primary px-4 py-3 outline-none transition-all appearance-none">
                <option>Ubuntu 22.04 LTS</option>
                <option>Debian 11</option>
                <option>CentOS Stream 9</option>
                <option>Windows Server 2022</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Instance Type</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <label className="relative cursor-pointer group">
                <input checked={instanceType === 'small'} onChange={() => setInstanceType('small')} className="peer sr-only" name="instance_type" type="radio" />
                <div className="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c252e] peer-checked:border-primary peer-checked:bg-primary/5 transition-all h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 group-hover:text-primary">memory</span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white">Small</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">1 vCPU, 2GB RAM</p>
                    <p className="text-xs font-semibold text-primary mt-2">$0.007/hr</p>
                  </div>
                </div>
              </label>
              <label className="relative cursor-pointer group">
                <input checked={instanceType === 'medium'} onChange={() => setInstanceType('medium')} className="peer sr-only" name="instance_type" type="radio" />
                <div className="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c252e] peer-checked:border-primary peer-checked:bg-primary/5 transition-all h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 group-hover:text-primary">developer_board</span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white">Medium</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">2 vCPU, 4GB RAM</p>
                    <p className="text-xs font-semibold text-primary mt-2">$0.015/hr</p>
                  </div>
                </div>
              </label>
              <label className="relative cursor-pointer group">
                <input checked={instanceType === 'large'} onChange={() => setInstanceType('large')} className="peer sr-only" name="instance_type" type="radio" />
                <div className="p-4 rounded-lg border-2 border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c252e] peer-checked:border-primary peer-checked:bg-primary/5 transition-all h-full">
                  <div className="flex flex-col items-center text-center">
                    <div className="w-12 h-12 mb-3 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                      <span className="material-symbols-outlined text-slate-600 dark:text-slate-400 group-hover:text-primary">settings_input_component</span>
                    </div>
                    <p className="font-bold text-slate-900 dark:text-white">Large</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">4 vCPU, 8GB RAM</p>
                    <p className="text-xs font-semibold text-primary mt-2">$0.032/hr</p>
                  </div>
                </div>
              </label>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">SSH Key</label>
            <textarea value={sshKey} onChange={(e) => setSshKey(e.target.value)} className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#1c252e] text-slate-900 dark:text-white font-mono text-xs focus:ring-primary focus:border-primary px-4 py-3 outline-none transition-all resize-none" placeholder="ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAAB..." rows={4}></textarea>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 italic">Paste your public key to secure your instance access.</p>
          </div>
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
            <div className="mb-2 text-sm min-h-[1.25rem]">
              {status === 'success' && <span className="text-emerald-600 dark:text-emerald-300">✅ Configuration sent successfully.</span>}
              {status === 'error' && <span className="text-rose-600 dark:text-rose-300">⚠️ {errorMessage || 'Failed to send configuration.'}</span>}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-end">
              <button onClick={onClose} className="px-6 py-2.5 rounded-lg text-slate-600 dark:text-slate-300 font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">Cancel</button>
              <button disabled={isSendDisabled} onClick={sendConfig} className={`px-6 py-2.5 rounded-lg text-white font-semibold transition-all ${isSendDisabled ? 'bg-slate-400 cursor-not-allowed' : 'bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20'}`}>
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
