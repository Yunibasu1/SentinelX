import { useEffect, useRef, useState } from 'react'
import { useMutation } from '@tanstack/react-query'

import { aiService } from '../services/api'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

const SUGGESTIONS = [
  'Analiza los riesgos de mis últimos análisis',
  '¿Qué debo hacer primero?',
  'Explica cómo mejorar mis contraseñas',
  '¿Qué es un certificado SSL expirado?',
]

export default function AiAssistant() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)

  const { mutate, isPending, error } = useMutation({
    mutationFn: aiService.chat,
    onSuccess: (r) => {
      setMessages((prev) => [...prev, { role: 'assistant', content: r.answer }])
    },
  })

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isPending])

  const handleSubmit = (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isPending) return
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])
    setInput('')
    mutate(trimmed)
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-white">Asistente IA</h1>
        <p className="mt-1 text-slate-400">
          Pregúntale a SentinelAI sobre tus análisis: interpreta resultados y propone remediaciones.
        </p>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {SUGGESTIONS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => handleSubmit(s)}
            disabled={isPending}
            className="rounded-full border border-slate-700 bg-ink-900 px-3 py-1 text-xs text-slate-300 hover:border-brand-500 hover:text-white disabled:opacity-50"
          >
            {s}
          </button>
        ))}
      </div>

      <div className="flex h-[55vh] flex-col rounded-xl border border-slate-800 bg-ink-900">
        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {messages.length === 0 ? (
            <p className="pt-8 text-center text-sm text-slate-500">
              Escribe una pregunta o usa las sugerencias. SentinelAI conoce tus últimos análisis de
              DNS, SSL, WHOIS, contraseñas y hashes.
            </p>
          ) : (
            messages.map((m, i) => (
              <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
                <div
                  className={
                    m.role === 'user'
                      ? 'max-w-[75%] rounded-2xl rounded-br-sm bg-brand-600 px-4 py-2 text-sm text-white'
                      : 'max-w-[85%] whitespace-pre-wrap rounded-2xl rounded-bl-sm bg-slate-800 px-4 py-2 text-sm text-slate-200'
                  }
                >
                  {m.content}
                </div>
              </div>
            ))
          )}

          {isPending ? (
            <div className="flex justify-start">
              <div className="max-w-[85%] rounded-2xl rounded-bl-sm bg-slate-800 px-4 py-2 text-sm text-slate-300">
                SentinelAI está pensando…
              </div>
            </div>
          ) : null}

          <div ref={bottomRef} />
        </div>

        {error ? (
          <p className="border-t border-slate-800 px-4 py-2 text-sm text-red-400">
            {error instanceof Error ? error.message : 'Error al contactar con el asistente'}
          </p>
        ) : null}

        <form
          onSubmit={(e) => {
            e.preventDefault()
            handleSubmit(input)
          }}
          className="flex gap-2 border-t border-slate-800 p-3"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregunta sobre ciberseguridad…"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none focus:border-brand-500"
          />
          <button
            type="submit"
            disabled={isPending}
            className="rounded-lg bg-brand-600 px-5 py-2 text-sm font-medium text-white hover:bg-brand-500 disabled:opacity-60"
          >
            Enviar
          </button>
        </form>
      </div>

      <p className="mt-3 text-xs text-slate-500">
        Nota: la versión gratuita de Groq tiene límites de consultas por minuto y por día. Si
        aparece un mensaje de límite, espera un rato y vuelve a intentarlo.
      </p>
    </div>
  )
}
