import type { DNSLookup, DNSLookupSummary, DashboardStats, FileHash, JwtInspection, PasswordCheck, SSLCheck, TokenResponse, User, WhoisCheck } from '../types/auth'

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
}

export const sslService = {
  check: (domain: string) =>
    request<SSLCheck>('/ssl/check', { method: 'POST', body: JSON.stringify({ domain }) }),
  history: () => request<SSLCheck[]>('/ssl/history'),
}

export const whoisService = {
  check: (domain: string) =>
    request<WhoisCheck>('/whois/check', { method: 'POST', body: JSON.stringify({ domain }) }),
  history: () => request<WhoisCheck[]>('/whois/history'),
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
}

export const passwordService = {
  check: (password: string) =>
    request<PasswordCheck>('/password/check', { method: 'POST', body: JSON.stringify({ password }) }),
  history: () => request<PasswordCheck[]>('/password/history'),
}

export const jwtService = {
  inspect: (token: string) =>
    request<JwtInspection>('/jwt/inspect', { method: 'POST', body: JSON.stringify({ token }) }),
  history: () => request<JwtInspection[]>('/jwt/history'),
}

export interface AiChatResponse {
  answer: string
}

export const aiService = {
  chat: (message: string) =>
    request<AiChatResponse>('/ai/chat', { method: 'POST', body: JSON.stringify({ message }) }),
}
