import { useState } from 'react'

import { reportService } from '../services/api'

type Format = 'csv' | 'excel' | 'pdf'

const FORMATS: { id: Format; name: string; desc: string; color: string }[] = [
  { id: 'pdf', name: 'PDF', desc: 'Informe ejecutivo con secciones por módulo', color: 'text-red-400' },
  { id: 'excel', name: 'Excel', desc: 'Tabla con todos los análisis en columnas', color: 'text-emerald-400' },
  { id: 'csv', name: 'CSV', desc: 'Datos planos, ideal para abrir en cualquier hoja de cálculo', color: 'text-sky-400' },
]

export default function Reports() {
  const [loading, setLoading] = useState<Format | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleDownload = async (format: Format) => {
    setLoading(format)
    setError(null)
    try {
      await reportService.download(format)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al generar el informe')
    } finally {
      setLoading(null)
    }
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Reportes</h1>
        <p className="mt-1 text-slate-400">
          Exporta todos tus análisis de SentinelX (SSL, DNS, WHOIS, contraseñas, hashes y JWT) en
          el formato que prefieras.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {FORMATS.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => handleDownload(f.id)}
            disabled={loading !== null}
            className="group rounded-xl border border-slate-800 bg-ink-900 p-6 text-left transition hover:border-brand-500 disabled:opacity-50"
          >
            <p className={`text-lg font-semibold ${f.color}`}>{f.name}</p>
            <p className="mt-1 text-sm text-slate-400">{f.desc}</p>
            <p className="mt-4 text-sm font-medium text-brand-400 group-hover:text-brand-300">
              {loading === f.id ? 'Generando…' : 'Descargar ↓'}
            </p>
          </button>
        ))}
      </div>

      {error ? (
        <p className="mt-6 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      <p className="mt-8 text-xs text-slate-500">
        Los informes incluyen únicamente los datos de tu cuenta y se generan al momento. No se
        guardan copias en el servidor.
      </p>
    </div>
  )
}
