import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import DetailModal from '../components/DetailModal'
import RecordActions from '../components/RecordActions'
import { dnsService } from '../services/api'
import type { DNSLookup, DNSRecord } from '../types/auth'

const RECORD_COLORS: Record<string, string> = {
  A: 'text-sky-400 border-sky-500/30 bg-sky-500/10',
  AAAA: 'text-violet-400 border-violet-500/30 bg-violet-500/10',
  CNAME: 'text-amber-400 border-amber-500/30 bg-amber-500/10',
  MX: 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10',
  NS: 'text-pink-400 border-pink-500/30 bg-pink-500/10',
  TXT: 'text-orange-400 border-orange-500/30 bg-orange-500/10',
  DMARC: 'text-red-400 border-red-500/30 bg-red-500/10',
}

function RecordBadge({ type }: { type: string }) {
  const color = RECORD_COLORS[type] ?? 'text-slate-400 border-slate-500/30 bg-slate-500/10'
  return (
    <span className={`inline-block rounded px-2 py-0.5 text-xs font-semibold border ${color}`}>
      {type}
    </span>
  )
}

function RecordsGroup({ type, records }: { type: string; records: DNSRecord[] }) {
  return (
    <div className="rounded-xl border border-slate-800 bg-ink-900 p-5">
      <div className="mb-3 flex items-center justify-between">
        <span className="font-medium text-white">{type} Records</span>
        <span className="text-xs text-slate-500">{records.length} encontrado(s)</span>
      </div>
      {records.length === 0 ? (
        <p className="text-sm text-slate-500">No se encontraron registros.</p>
      ) : (
        <ul className="space-y-1.5">
          {records.map((record, i) => (
            <li key={i} className="flex items-start justify-between gap-3 rounded-lg bg-ink-950 px-3 py-2">
              <code className="break-all text-sm text-slate-300">{record.value}</code>
              {record.priority !== null ? (
                <span className="shrink-0 text-xs text-slate-500">prio {record.priority}</span>
              ) : null}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default function DNSAnalyzer() {
  const queryClient = useQueryClient()
  const [domain, setDomain] = useState('')
  const [result, setResult] = useState<DNSLookup | null>(null)
  const [detail, setDetail] = useState<DNSLookup | null>(null)

  const { data: history } = useQuery({
    queryKey: ['dns-history'],
    queryFn: dnsService.history,
  })

  const analyze = useMutation({
    mutationFn: dnsService.analyze,
    onSuccess: (lookup) => {
      setResult(lookup)
      setDomain('')
      queryClient.invalidateQueries({ queryKey: ['dns-history'] })
    },
  })

  const remove = useMutation({
    mutationFn: dnsService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['dns-history'] }),
  })

  const grouped = result
    ? result.records.reduce<Record<string, DNSRecord[]>>((acc, record) => {
        ;(acc[record.type] ??= []).push(record)
        return acc
      }, {})
    : {}

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (domain.trim()) analyze.mutate(domain.trim())
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">DNS Analyzer</h1>
        <p className="mt-1 text-slate-400">
          Consulta los registros DNS de cualquier dominio y guárdalos en tu historial.
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
          disabled={analyze.isPending}
          className="rounded-lg bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-500 disabled:opacity-60"
        >
          {analyze.isPending ? 'Analizando...' : 'Analizar'}
        </button>
      </form>

      {analyze.isError ? (
        <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {analyze.error instanceof Error ? analyze.error.message : 'Error al analizar el dominio'}
        </p>
      ) : null}

      {result ? (
        <div className="mb-8">
          <div className="mb-4 flex items-center gap-3">
            <h2 className="text-lg font-medium text-white">{result.domain}</h2>
            <span className="text-xs text-slate-500">
              Análisis #{result.id} · {new Date(result.created_at).toLocaleString()}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(grouped).map(([type, records]) => (
              <RecordsGroup key={type} type={type} records={records} />
            ))}
          </div>
        </div>
      ) : null}

      <div>
        <h2 className="mb-4 text-lg font-medium text-white">Historial de análisis</h2>
        {!history || history.length === 0 ? (
          <p className="text-slate-500">Aún no has analizado ningún dominio.</p>
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
                    {new Date(item.created_at).toLocaleString()} · {item.record_count} registros
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <RecordBadge type="DNS" />
                  <RecordActions
                    onView={() => dnsService.detail(item.id).then(setDetail)}
                    onDelete={() => remove.mutate(item.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DetailModal
        title={detail ? `Análisis DNS · ${detail.domain}` : ''}
        record={detail}
        onClose={() => setDetail(null)}
      />
    </div>
  )
}
