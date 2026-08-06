import type { ActivityLogItem, CompareDNSResult, CompareSSLResult, DNSLookup, DNSLookupSummary, DashboardStats, FileHash, JwtInspection, NotificationItem, PasswordCheck, SSLCheck, TokenResponse, User, WhoisCheck } from '../types/auth'

const BASE_URL = import.meta.env.VITE_API_URL ?? '/api'
const ACCESS_KEY = 'sentinelx_access'
const REFRESH_KEY = 'sentinelx_refresh'

export function getAccessToken(): string | null {
  return localStorage.getItem(ACCESS_KEY)
}

export function saveTokens(tokens: TokenResponse): void {
  localStorage.setItem(ACCESS_KEY, tokens.access_token)
  localStorage.setItem(REFRESH_KEY, tokens.refresh_token)
}

export function clearTokens(): void {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getAccessToken()
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers })

  if (!res.ok) {
    let detail = 'Error del servidor'
    try {
      const body = await res.json()
      if (typeof body.detail === 'string') detail = body.detail
    } catch {
      /* sin cuerpo JSON */
    }
    throw new Error(detail)
  }

  return res.json() as Promise<T>
}

export const authService = {
  register: (data: { email: string; full_name: string; password: string }) =>
    request<User>('/auth/register', { method: 'POST', body: JSON.stringify(data) }),
  login: (data: { email: string; password: string }) =>
    request<TokenResponse>('/auth/login', { method: 'POST', body: JSON.stringify(data) }),
  me: () => request<User>('/auth/me'),
}

export const dashboardService = {
  stats: () => request<DashboardStats>('/dashboard/stats'),
}

export const dnsService = {
  analyze: (domain: string) =>
    request<DNSLookup>('/dns/analyze', { method: 'POST', body: JSON.stringify({ domain }) }),
  history: () => request<DNSLookupSummary[]>('/dns/history'),
  detail: (id: number) => request<DNSLookup>(`/dns/history/${id}`),
  remove: (id: number) => request<{ ok: boolean }>(`/dns/history/${id}`, { method: 'DELETE' }),
}

export const sslService = {
  check: (domain: string) =>
    request<SSLCheck>('/ssl/check', { method: 'POST', body: JSON.stringify({ domain }) }),
  history: () => request<SSLCheck[]>('/ssl/history'),
  detail: (id: number) => request<SSLCheck>(`/ssl/history/${id}`),
  remove: (id: number) => request<{ ok: boolean }>(`/ssl/history/${id}`, { method: 'DELETE' }),
}

export const whoisService = {
  check: (domain: string) =>
    request<WhoisCheck>('/whois/check', { method: 'POST', body: JSON.stringify({ domain }) }),
  history: () => request<WhoisCheck[]>('/whois/history'),
  detail: (id: number) => request<WhoisCheck>(`/whois/history/${id}`),
  remove: (id: number) => request<{ ok: boolean }>(`/whois/history/${id}`, { method: 'DELETE' }),
}

export async function hashFile(file: File): Promise<FileHash> {
  const token = getAccessToken()
  const form = new FormData()
  form.append('file', file)
  const res = await fetch(`${BASE_URL}/hash/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: form,
  })
  if (!res.ok) {
    let detail = 'Error del servidor'
    try {
      const body = await res.json()
      if (typeof body.detail === 'string') detail = body.detail
    } catch {
      /* sin cuerpo JSON */
    }
    throw new Error(detail)
  }
  return res.json() as Promise<FileHash>
}

export const hashService = {
  upload: hashFile,
  history: () => request<FileHash[]>('/hash/history'),
  detail: (id: number) => request<FileHash>(`/hash/history/${id}`),
  remove: (id: number) => request<{ ok: boolean }>(`/hash/history/${id}`, { method: 'DELETE' }),
}

export const passwordService = {
  check: (password: string) =>
    request<PasswordCheck>('/password/check', { method: 'POST', body: JSON.stringify({ password }) }),
  history: () => request<PasswordCheck[]>('/password/history'),
  detail: (id: number) => request<PasswordCheck>(`/password/history/${id}`),
  remove: (id: number) => request<{ ok: boolean }>(`/password/history/${id}`, { method: 'DELETE' }),
}

export const jwtService = {
  inspect: (token: string) =>
    request<JwtInspection>('/jwt/inspect', { method: 'POST', body: JSON.stringify({ token }) }),
  history: () => request<JwtInspection[]>('/jwt/history'),
  detail: (id: number) => request<JwtInspection>(`/jwt/history/${id}`),
  remove: (id: number) => request<{ ok: boolean }>(`/jwt/history/${id}`, { method: 'DELETE' }),
}

export interface AiChatResponse {
  answer: string
}

export const aiService = {
  chat: (message: string) =>
    request<AiChatResponse>('/ai/chat', { method: 'POST', body: JSON.stringify({ message }) }),
}

async function downloadReport(format: 'csv' | 'excel' | 'pdf'): Promise<void> {
  const token = getAccessToken()
  const names: Record<typeof format, string> = {
    csv: 'informe_sentinelx.csv',
    excel: 'informe_sentinelx.xlsx',
    pdf: 'informe_sentinelx.pdf',
  }
  const res = await fetch(`${BASE_URL}/reports/${format}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })
  if (!res.ok) throw new Error('No se pudo generar el informe')
  const blob = await res.blob()
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = names[format]
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export const reportService = {
  download: downloadReport,
}

export const notificationService = {
  list: () => request<NotificationItem[]>('/notifications'),
  unreadCount: () => request<number>('/notifications/unread-count'),
  markRead: (id: number) => request<NotificationItem>(`/notifications/${id}/read`, { method: 'POST' }),
  checkCerts: () => request<{ ok: boolean }>('/notifications/check-certs'),
  logs: () => request<ActivityLogItem[]>('/notifications/logs'),
}

export const compareService = {
  dns: (domain: string) => request<CompareDNSResult>(`/compare/dns?domain=${encodeURIComponent(domain)}`),
  ssl: (domain: string) => request<CompareSSLResult>(`/compare/ssl?domain=${encodeURIComponent(domain)}`),
}
