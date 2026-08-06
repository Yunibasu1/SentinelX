import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import { jwtService } from '../services/api'
import type { JwtInspection } from '../types/auth'

function InfoRow({ label, value }: { label: string; value: string | null | number }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-800/60 py-2 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <code className="break-all text-right text-sm text-slate-200">{value ?? '—'}</code>
    </div>
  )
}

export default function JwtInspector() {
  const queryClient = useQueryClient()
  const [token, setToken] = useState('')
  const [result, setResult] = useState<JwtInspection | null>(null)

  const { data: history } = useQuery({ queryKey: ['jwt-history'], queryFn: jwtService.history })

  const inspect = useMutation({
    mutationFn: jwtService.inspect,
    onSuccess: (r) => {
      setResult(r)
      setToken('')
      queryClient.invalidateQueries({ queryKey: ['jwt-history'] })
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (token.trim()) inspect.mutate(token.trim())
  }

  let warnings: string[] = []
  if (result?.warnings) {
    warnings = result.warnings
      .split('\n')
      .map((w) => w.trim())
      .filter(Boolean)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">JWT Inspector</h1>
        <p className="mt-1 text-slate-400">
          Decodifica un token JWT y detecta riesgos de seguridad: algoritmo, expiración y datos sensibles.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <textarea
          required
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
          rows={3}
          className="flex-1 resize-y rounded-lg border border-slate-700 bg-ink-900 px-3 py-2 font-mono text-xs text-white outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={inspect.isPending}
          className="self-end rounded-lg bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-500 disabled:opacity-60"
        >
          {inspect.isPending ? 'Inspeccionando...' : 'Inspeccionar'}
        </button>
      </form>

      {inspect.isError ? (
        <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {inspect.error instanceof Error ? inspect.error.message : 'Error al inspeccionar el token'}
        </p>
      ) : null}

      {result ? (
        <div className="mb-8 rounded-xl border border-slate-800 bg-ink-900 p-5">
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-lg font-medium text-white">Resultado</h2>
            <span className="rounded bg-brand-500/15 px-2 py-0.5 text-xs font-semibold text-brand-400">
              {result.algorithm ?? '—'}
            </span>
          </div>

          <div className="mb-4 space-y-2">
            {warnings.map((w) => {
              const isAlert = w.startsWith('ALERTA')
              return (
                <p
                  key={w}
                  className={`rounded-lg border px-3 py-2 text-sm ${
                    isAlert
                      ? 'border-red-500/30 bg-red-500/10 text-red-400'
                      : 'border-yellow-500/30 bg-yellow-500/10 text-yellow-400'
                  }`}
                >
                  {w}
                </p>
              )
            })}
          </div>

          <InfoRow label="Sujeto (sub)" value={result.subject} />
          <InfoRow label="Emisor (iss)" value={result.issuer} />
          <InfoRow label="Audiencia (aud)" value={result.audience} />
          <InfoRow label="Emitido (iat)" value={result.issued_at?.replace('T', ' ').slice(0, 16) ?? null} />
          <InfoRow label="Expira (exp)" value={result.expires_at?.replace('T', ' ').slice(0, 16) ?? null} />

          {result.payload_json ? (
            <div className="mt-4">
              <p className="mb-1 text-sm font-medium text-slate-300">Payload decodificado</p>
              <pre className="overflow-x-auto rounded-lg bg-slate-950 p-3 text-xs text-emerald-400">
                {result.payload_json}
              </pre>
            </div>
          ) : null}
        </div>
      ) : null}

      <div>
        <h2 className="mb-4 text-lg font-medium text-white">Historial</h2>
        {!history || history.length === 0 ? (
          <p className="text-slate-500">Aún no has inspeccionado ningún token.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-slate-800 bg-ink-900 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <p className="font-mono text-xs text-slate-200">{item.subject ?? 'sin sub'}</p>
                  <p className="text-xs text-slate-500">{new Date(item.created_at).toLocaleString()}</p>
                </div>
                <p className="mt-1 text-xs text-slate-500">
                  {item.algorithm ?? '—'}
                  {item.expires_at ? ` · expira ${new Date(item.expires_at).toLocaleString()}` : ''}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
