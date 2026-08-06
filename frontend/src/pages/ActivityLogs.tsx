import { useQuery } from '@tanstack/react-query'

import { notificationService } from '../services/api'

export default function ActivityLogs() {
  const { data: logs } = useQuery({ queryKey: ['logs'], queryFn: notificationService.logs })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Logs de actividad</h1>
        <p className="mt-1 text-slate-400">
          Registro de las acciones realizadas en tu cuenta de SentinelX.
        </p>
      </div>

      {!logs || logs.length === 0 ? (
        <p className="text-slate-500">Aún no hay actividad registrada.</p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-800">
          <table className="w-full text-sm">
            <thead className="bg-ink-900 text-left text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Fecha</th>
                <th className="px-4 py-3 font-medium">Acción</th>
                <th className="px-4 py-3 font-medium">Detalle</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 bg-ink-900/60">
              {logs.map((l) => (
                <tr key={l.id}>
                  <td className="whitespace-nowrap px-4 py-2.5 text-slate-400">
                    {new Date(l.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-2.5 font-medium text-white">{l.action}</td>
                  <td className="max-w-md truncate px-4 py-2.5 text-slate-300">{l.detail || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
