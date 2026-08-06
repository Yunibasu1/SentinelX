import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import DetailModal from '../components/DetailModal'
import RecordActions from '../components/RecordActions'
import { passwordService } from '../services/api'
import type { PasswordCheck } from '../types/auth'

const SCORE_LABELS = ['Muy débil', 'Débil', 'Aceptable', 'Fuerte', 'Excelente']
const SCORE_COLORS = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-lime-500', 'bg-emerald-500']

function InfoRow({ label, value }: { label: string; value: string | number | boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-800/60 py-2 last:border-0">
      <span className="text-sm text-slate-400">{label}</span>
      <span className="text-sm text-slate-200">
        {typeof value === 'boolean' ? (value ? 'Sí' : 'No') : value}
      </span>
    </div>
  )
}

function formatCrackTime(seconds: number): string {
  if (seconds < 60) return `${Math.round(seconds)} segundos`
  if (seconds < 3600) return `${(seconds / 60).toFixed(1)} minutos`
  if (seconds < 86400) return `${(seconds / 3600).toFixed(1)} horas`
  if (seconds < 2592000) return `${(seconds / 86400).toFixed(1)} días`
  if (seconds < 31536000) return `${(seconds / 2592000).toFixed(1)} meses`
  const years = seconds / 31536000
  return years > 1e9 ? 'más de mil millones de años' : `${years.toLocaleString('es-ES')} años`
}

export default function PasswordChecker() {
  const queryClient = useQueryClient()
  const [password, setPassword] = useState('')
  const [result, setResult] = useState<PasswordCheck | null>(null)
  const [detail, setDetail] = useState<PasswordCheck | null>(null)

  const { data: history } = useQuery({ queryKey: ['password-history'], queryFn: passwordService.history })

  const check = useMutation({
    mutationFn: passwordService.check,
    onSuccess: (r) => {
      setResult(r)
      queryClient.invalidateQueries({ queryKey: ['password-history'] })
    },
  })

  const remove = useMutation({
    mutationFn: passwordService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['password-history'] }),
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (password) check.mutate(password)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Password Checker</h1>
        <p className="mt-1 text-slate-400">
          Analiza la fortaleza de una contraseña: entropía, patrones y tiempo estimado de fuerza bruta.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mb-6 flex gap-2">
        <input
          type="password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Escribe una contraseña para analizar"
          className="flex-1 rounded-lg border border-slate-700 bg-ink-900 px-3 py-2 text-white outline-none focus:border-brand-500"
        />
        <button
          type="submit"
          disabled={check.isPending}
          className="rounded-lg bg-brand-600 px-5 py-2 font-medium text-white hover:bg-brand-500 disabled:opacity-60"
        >
          {check.isPending ? 'Analizando...' : 'Analizar'}
        </button>
      </form>

      {check.isError ? (
        <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {check.error instanceof Error ? check.error.message : 'Error al analizar la contraseña'}
        </p>
      ) : null}

      {result ? (
        <div className="mb-8 rounded-xl border border-slate-800 bg-ink-900 p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Resultado</h2>
            <span className="rounded px-2 py-0.5 text-xs font-semibold text-slate-200">
              {SCORE_LABELS[result.score]} · {result.score}/4
            </span>
          </div>

          <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className={`h-full rounded-full transition-all ${SCORE_COLORS[result.score]}`}
              style={{ width: `${((result.score + 1) / 5) * 100}%` }}
            />
          </div>

          {result.in_dictionary ? (
            <p className="mb-4 rounded-lg border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-sm text-orange-400">
              Esta contraseña aparece en diccionarios de contraseñas filtradas. No la uses.
            </p>
          ) : null}

          <InfoRow label="Longitud" value={`${result.password_length} caracteres`} />
          <InfoRow label="Entropía" value={`${result.entropy_bits.toFixed(1)} bits`} />
          <InfoRow label="Minúsculas" value={result.has_lower} />
          <InfoRow label="Mayúsculas" value={result.has_upper} />
          <InfoRow label="Dígitos" value={result.has_digit} />
          <InfoRow label="Símbolos" value={result.has_special} />
          <InfoRow label="Tiempo de fuerza bruta" value={formatCrackTime(result.crack_time_seconds)} />
        </div>
      ) : null}

      <div>
        <h2 className="mb-4 text-lg font-medium text-white">Historial</h2>
        {!history || history.length === 0 ? (
          <p className="text-slate-500">Aún no has analizado ninguna contraseña.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-3 rounded-xl border border-slate-800 bg-ink-900 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-white">{item.password_length} caracteres</p>
                  <p className="text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleString()} · {item.entropy_bits.toFixed(0)} bits de entropía
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`rounded px-2 py-0.5 text-xs font-semibold text-slate-200 ${SCORE_COLORS[item.score]}`}
                  >
                    {SCORE_LABELS[item.score]}
                  </span>
                  <RecordActions
                    onView={() => passwordService.detail(item.id).then(setDetail)}
                    onDelete={() => remove.mutate(item.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DetailModal
        title={detail ? `Contraseña · ${SCORE_LABELS[detail.score]}` : ''}
        record={detail}
        onClose={() => setDetail(null)}
      />
    </div>
  )
}
