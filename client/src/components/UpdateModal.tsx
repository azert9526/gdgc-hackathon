import { useEffect, useState } from 'react'

export interface ServiceConfig {
  project_id: string
  region: string
  service_name: string
  container_image: string
  env: { MODEL_PROVIDER: string }
  allowed_ips: string[]
}

export interface UpdateModalProps {
  open: boolean
  onClose: () => void
  initial?: Partial<ServiceConfig>
  onSave?: (cfg: ServiceConfig) => void
}

// to change if used
const defaults: ServiceConfig = {
  project_id: 'mate-tester-hak',
  region: 'europe-west1',
  service_name: 'test-app',
  container_image: 'docker.io/bluegalaxy4012/piighost:v1',
  env: { MODEL_PROVIDER: 'chatgpt' },
  allowed_ips: ['0.0.0.0/0'],
}

const UpdateModal = ({ open, onClose, initial, onSave }: UpdateModalProps) => {
  const [cfg, setCfg] = useState<ServiceConfig>({ ...defaults, ...(initial || {}) })

  useEffect(() => {
    if (open) setCfg({ ...defaults, ...(initial || {}) })
  }, [open, initial])

  if (!open) return null

  const save = () => {
    onSave?.(cfg)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="w-full max-w-xl rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#161e27] shadow-2xl max-h-[85vh] overflow-hidden">
        <div className="flex items-start justify-between p-6 border-b border-slate-200 dark:border-slate-800">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Update Service Configuration</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">Edit and save the deployment config for this service.</p>
          </div>
          <button onClick={onClose} className="rounded-md p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-slate-200 transition-colors" aria-label="Close modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="h-[calc(85vh-140px)] overflow-y-auto p-6 space-y-4 custom-scrollbar">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Project ID</label>
            <input value={cfg.project_id} onChange={(e) => setCfg(s => ({ ...s, project_id: e.target.value }))} className="w-full rounded-lg border px-4 py-3" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Region</label>
              <select value={cfg.region} onChange={(e) => setCfg(s => ({ ...s, region: e.target.value }))} className="w-full rounded-lg border px-4 py-3">
                <option value="europe-west1">europe-west1</option>
                <option value="us-central1">us-central1</option>
                <option value="asia-northeast1">asia-northeast1</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Service Name</label>
              <input value={cfg.service_name} onChange={(e) => setCfg(s => ({ ...s, service_name: e.target.value }))} className="w-full rounded-lg border px-4 py-3" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Container Image</label>
            <input value={cfg.container_image} onChange={(e) => setCfg(s => ({ ...s, container_image: e.target.value }))} className="w-full rounded-lg border px-4 py-3" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Model Provider</label>
            <select value={cfg.env.MODEL_PROVIDER} onChange={(e) => setCfg(s => ({ ...s, env: { MODEL_PROVIDER: e.target.value } }))} className="w-full rounded-lg border px-4 py-3">
              <option value="chatgpt">ChatGPT</option>
              <option value="gemini">Gemini</option>
              <option value="claude">Claude</option>
              <option value="bard">Bard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Allowed IPs</label>
            <div className="space-y-2">
              {cfg.allowed_ips.map((ip, idx) => (
                <div key={idx} className="flex gap-2 items-center">
                  <input value={ip} onChange={(e) => setCfg(s => ({ ...s, allowed_ips: s.allowed_ips.map((v,i) => i===idx ? e.target.value : v) }))} className="flex-1 rounded-lg border px-3 py-2" />
                  <button onClick={() => setCfg(s => ({ ...s, allowed_ips: s.allowed_ips.filter((_,i) => i!==idx) }))} className="px-3">Remove</button>
                </div>
              ))}
              <button onClick={() => setCfg(s => ({ ...s, allowed_ips: [...s.allowed_ips, ''] }))} className="text-sm text-primary">Add IP</button>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button onClick={onClose} className="px-4 py-2">Cancel</button>
            <button onClick={save} className="px-4 py-2 bg-primary text-white rounded">Save</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UpdateModal
