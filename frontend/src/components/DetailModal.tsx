import { useEffect } from 'react'

function formatValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  return String(value)
}

export default function DetailModal({
  title,
  record,
  onClose,
}: {
  title: string
  record: unknown
  onClose: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  if (!record) return null
  const entries = Object.entries(record as Record<string, unknown>)

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-800 bg-ink-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg font-medium text-white">{title}</h3>
          <button
            onClick={onClose}
            className="rounded bg-slate-800 px-2.5 py-1 text-sm text-slate-300 hover:bg-slate-700"
          >
            Cerrar
          </button>
        </div>
        <dl className="divide-y divide-slate-800/60">
          {entries.map(([key, value]) => (
            <div
              key={key}
              className="flex flex-col gap-1 py-2 sm:flex-row sm:items-start sm:justify-between sm:gap-6"
            >
              <dt className="shrink-0 font-mono text-xs uppercase tracking-wide text-slate-500">
                {key}
              </dt>
              <dd className="break-all text-sm text-slate-200">
                {typeof value === 'object' && value !== null ? (
                  <pre className="max-h-64 overflow-auto whitespace-pre-wrap rounded-lg bg-slate-950 p-3 text-xs text-emerald-400">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                ) : (
                  formatValue(value)
                )}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}
