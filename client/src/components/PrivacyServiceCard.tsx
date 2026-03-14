export interface PrivacyServiceCardProps {
  title: string
  desc: string
  price: string
  onOpen: () => void
}

const PrivacyServiceCard = ({ title, desc, price, onOpen }: PrivacyServiceCardProps) => (
  <div className="group flex flex-col rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-md transition-all duration-300 border-l-4 border-l-primary">
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-500">
      <span className="material-symbols-outlined text-2xl">shield</span>
    </div>
    <h3 className="text-lg font-bold text-slate-900 dark:text-white">{title}</h3>
    <p className="mt-2 flex-grow text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
    <div className="mt-4 flex items-center justify-between">
      <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wide">{price}</span>
    </div>
    <button onClick={onOpen} className="mt-6 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-white hover:bg-primary/90 transition-colors">Open Privacy LLM</button>
  </div>
)

export default PrivacyServiceCard
