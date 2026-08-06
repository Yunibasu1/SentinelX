import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { notificationService } from '../services/api'

const KIND_STYLES: Record<string, string> = {
  warning: 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400',
  info: 'border-slate-700 bg-slate-800/40 text-slate-300',
  alert: 'border-red-500/30 bg-red-500/10 text-red-400',
}

export default function Notifications() {
  const queryClient = useQueryClient()

  const { data: notifications } = useQuery({
    queryKey: ['notifications'],
    queryFn: notificationService.list,
  })

  const markRead = useMutation({
    mutationFn: notificationService.markRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
      queryClient.invalidateQueries({ queryKey: ['unread-count'] })
    },
  })

  const checkCerts = useMutation({
    mutationFn: notificationService.checkCerts,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  })

  const unread = notifications?.filter((n) => !n.read).length ?? 0

  return (
    <div>
      <div className="mb-6 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Notificaciones</h1>
          <p className="mt-1 text-slate-400">
            Alertas de tu infraestructura, por ejemplo certificados SSL a punto de expirar.
          </p>
        </div>
        <button
          type="button"
          onClick={() => checkCerts.mutate()}
          disabled={checkCerts.isPending}
          className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300 hover:border-brand-500 hover:text-white disabled:opacity-60"
        >
          {checkCerts.isPending ? 'Revisando…' : 'Revisar certificados'}
        </button>
      </div>

      {unread > 0 ? (
        <p className="mb-4 text-sm text-brand-400">Tienes {unread} sin leer.</p>
      ) : null}

      {!notifications || notifications.length === 0 ? (
        <p className="text-slate-500">
          No hay notificaciones. Pulsa "Revisar certificados" para comprobar tus SSL.
        </p>
      ) : (
        <ul className="space-y-2">
          {notifications.map((n) => (
            <li
              key={n.id}
              className={`rounded-xl border px-4 py-3 ${KIND_STYLES[n.kind] ?? KIND_STYLES.info} ${
                n.read ? 'opacity-50' : ''
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{n.title}</p>
                  <p className="mt-0.5 text-sm">{n.message}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  <span className="text-xs opacity-70">{new Date(n.created_at).toLocaleString()}</span>
                  {!n.read ? (
                    <button
                      type="button"
                      onClick={() => markRead.mutate(n.id)}
                      className="text-xs underline hover:opacity-70"
                    >
                      Marcar leída
                    </button>
                  ) : null}
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
