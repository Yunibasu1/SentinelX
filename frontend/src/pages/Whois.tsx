import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import DetailModal from '../components/DetailModal'
import RecordActions from '../components/RecordActions'
import { whoisService } from '../services/api'
import type { WhoisCheck } from '../types/auth'

function InfoRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-slate-800/60 py-2 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <code className="break-all text-right text-sm text-slate-200">{value ?? '—'}</code>
    </div>
  )
}

export default function Whois() {
  const queryClient = useQueryClient()
  const [domain, setDomain] = useState('')
  const [result, setResult] = useState<WhoisCheck | null>(null)
  const [detail, setDetail] = useState<WhoisCheck | null>(null)

  const { data: history } = useQuery({ queryKey: ['whois-history'], queryFn: whoisService.history })

  const check = useMutation({
    mutationFn: whoisService.check,
    onSuccess: (r) => {
      setResult(r)
      setDomain('')
      queryClient.invalidateQueries({ queryKey: ['whois-history'] })
    },
  })

  const remove = useMutation({
    mutationFn: whoisService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['whois-history'] }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (domain.trim()) check.mutate(domain.trim())
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">WHOIS</h1>
        <p className="mt-1 text-slate-400">
          Consulta quién registró un dominio: propietario, registrador y fechas de expiración.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          type="text"
          required
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          placeholder="ejemplo: google.com"
          className="flex-1 rounded-lg border border-slate-700 bg-ink-900 px-3 py-2 text-white outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={check.isPending}
          className="rounded-lg bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-500 disabled:opacity-60"
        >
          {check.isPending ? 'Consultando...' : 'Consultar'}
        </button>
      </form>

      {check.isError ? (
        <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {check.error instanceof Error ? check.error.message : 'Error en la consulta WHOIS'}
        </p>
      ) : null}

      {result ? (
        <div className="mb-8 rounded-xl border border-slate-800 bg-ink-900 p-5">
          <div className="mb-3 flex items-center gap-3">
            <h2 className="text-lg font-medium text-white">{result.domain}</h2>
            {result.error ? (
              <span className="rounded bg-red-500/15 px-2 py-0.5 text-xs font-semibold text-red-400">Error</span>
            ) : (
              <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                Registrado
              </span>
            )}
          </div>

          {result.error ? (
            <p className="rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              {result.error}
            </p>
          ) : (
            <div>
              <InfoRow label="Registrador" value={result.registrar} />
              <InfoRow label="Estado" value={result.status} />
              <InfoRow label="Fecha de creación" value={result.creation_date?.replace('T', ' ').slice(0, 10) ?? null} />
              <InfoRow label="Fecha de expiración" value={result.expiration_date?.replace('T', ' ').slice(0, 10) ?? null} />
              <InfoRow label="Última actualización" value={result.updated_date?.replace('T', ' ').slice(0, 10) ?? null} />
              <InfoRow label="Nameservers" value={result.name_servers} />
            </div>
          )}
        </div>
      ) : null}

      <div>
        <h2 className="mb-4 text-lg font-medium text-white">Historial</h2>
        {!history || history.length === 0 ? (
          <p className="text-slate-500">Aún no has consultado ningún dominio.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-ink-900 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-white">{item.domain}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleString()}
                    {item.registrar ? ` · ${item.registrar}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                    OK
                  </span>
                  <RecordActions
                    onView={() => whoisService.detail(item.id).then(setDetail)}
                    onDelete={() => remove.mutate(item.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DetailModal
        title={detail ? `WHOIS · ${detail.domain}` : ''}
        record={detail}
        onClose={() => setDetail(null)}
      />
    </div>
  )
}
