import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

import DetailModal from '../components/DetailModal'
import RecordActions from '../components/RecordActions'
import { hashService } from '../services/api'
import type { FileHash } from '../types/auth'

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="ml-2 shrink-0 rounded bg-slate-800 px-2 py-0.5 text-xs text-slate-300 hover:bg-slate-700"
    >
      {copied ? 'Copiado' : 'Copiar'}
    </button>
  )
}

function HashRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-slate-800/60 py-2 last:border-0">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-sm font-medium text-slate-300">{label}</span>
        <CopyButton value={value} />
      </div>
      <code className="break-all text-xs text-emerald-400">{value}</code>
    </div>
  )
}

export default function FileHasher() {
  const queryClient = useQueryClient()
  const [result, setResult] = useState<FileHash | null>(null)
  const [detail, setDetail] = useState<FileHash | null>(null)

  const { data: history } = useQuery({ queryKey: ['hash-history'], queryFn: hashService.history })

  const upload = useMutation({
    mutationFn: hashService.upload,
    onSuccess: (r) => {
      setResult(r)
      queryClient.invalidateQueries({ queryKey: ['hash-history'] })
    },
  })

  const remove = useMutation({
    mutationFn: hashService.remove,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['hash-history'] }),
  })

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) upload.mutate(file)
  }

  const formatSize = (bytes: number) =>
    bytes < 1024 ? `${bytes} B` : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(2)} MB`

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Hash de Archivos</h1>
        <p className="mt-1 text-slate-400">
          Calcula la huella digital (SHA-256, SHA-512 y MD5) de cualquier archivo para verificar su integridad.
        </p>
      </div>

      <label className="mb-6 flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-slate-700 bg-ink-900 px-6 py-10 text-center transition hover:border-brand-500">
        <input
          type="file"
          className="hidden"
          onChange={handleFile}
          disabled={upload.isPending}
        />
        <span className="text-lg text-slate-300">
          {upload.isPending ? 'Calculando...' : 'Haz clic para seleccionar un archivo'}
        </span>
        <span className="mt-1 text-sm text-slate-500">Máximo 50 MB</span>
      </label>

      {upload.isError ? (
        <p className="mb-6 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
          {upload.error instanceof Error ? upload.error.message : 'Error al calcular el hash'}
        </p>
      ) : null}

      {result ? (
        <div className="mb-8 rounded-xl border border-slate-800 bg-ink-900 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">{result.filename}</h2>
            <span className="rounded bg-brand-500/15 px-2 py-0.5 text-xs font-semibold text-brand-400">
              {formatSize(result.size_bytes)}
            </span>
          </div>
          <HashRow label="SHA-256" value={result.sha256} />
          <HashRow label="SHA-512" value={result.sha512} />
          <HashRow label="MD5" value={result.md5} />
        </div>
      ) : null}

      <div>
        <h2 className="mb-4 text-lg font-medium text-white">Historial</h2>
        {!history || history.length === 0 ? (
          <p className="text-slate-500">Aún no has calculado ningún hash.</p>
        ) : (
          <ul className="space-y-2">
            {history.map((item) => (
              <li
                key={item.id}
                className="rounded-xl border border-slate-800 bg-ink-900 px-4 py-3"
              >
                <div className="flex items-center justify-between">
                  <p className="font-medium text-white">{item.filename}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(item.created_at).toLocaleString()} · {formatSize(item.size_bytes)}
                  </p>
                </div>
                <div className="mt-1 flex items-center justify-between gap-3">
                  <p className="truncate text-xs text-emerald-400">{item.sha256}</p>
                  <RecordActions
                    onView={() => hashService.detail(item.id).then(setDetail)}
                    onDelete={() => remove.mutate(item.id)}
                  />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <DetailModal
        title={detail ? `Hash · ${detail.filename}` : ''}
        record={detail}
        onClose={() => setDetail(null)}
      />
    </div>
  )
}
