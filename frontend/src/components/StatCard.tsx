import { ReactNode } from 'react'

interface StatCardProps {
  label: string
  value: number
  icon: ReactNode
  hint?: string
}

export default function StatCard({ label, value, icon, hint }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-800 bg-ink-900 p-5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        <span className="text-brand-500">{icon}</span>
      </div>
      <p className="mt-2 text-3xl font-bold text-white">{value}</p>
      {hint ? <p className="mt-1 text-xs text-slate-500">{hint}</p> : null}
    </div>
  )
}
