import { useQuery } from '@tanstack/react-query'

import StatCard from '../components/StatCard'
import { useAuth } from '../contexts/AuthContext'
import { dashboardService } from '../services/api'

export default function Dashboard() {
  const { user } = useAuth()
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardService.stats,
  })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-white">
          Bienvenido {user?.full_name}
        </h1>
        <p className="mt-1 text-slate-400">
          Resumen del estado de tu infraestructura.
        </p>
      </div>

      {isError ? (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
          No se pudo cargar el dashboard.{' '}
          <button onClick={() => refetch()} className="underline">
            Reintentar
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-28 animate-pulse rounded-xl border border-slate-800 bg-ink-900"
            />
          ))}
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Servidores"
            value={data?.servers ?? 0}
            icon={<span>🖥</span>}
            hint="Registrados en la plataforma"
          />
          <StatCard
            label="Dominios"
            value={data?.domains ?? 0}
            icon={<span>🌐</span>}
            hint="Bajo monitorización"
          />
          <StatCard
            label="SSL próximos a vencer"
            value={data?.ssl_expiring ?? 0}
            icon={<span>🔐</span>}
            hint="Menos de 30 días"
          />
          <StatCard
            label="Alertas"
            value={data?.alerts ?? 0}
            icon={<span>⚠</span>}
            hint="Requieren atención"
          />
        </div>
      )}

      <div className="mt-8 rounded-xl border border-slate-800 bg-ink-900 p-6">
        <h2 className="mb-2 text-lg font-medium text-white">Último análisis</h2>
        <p className="text-slate-400">{data?.last_scan ?? '—'}</p>
        <p className="mt-4 text-sm text-slate-500">
          Los módulos de análisis (escáner de red, SSL, DNS, WHOIS...) llegarán en
          las próximas versiones.
        </p>
      </div>
    </div>
  )
}
