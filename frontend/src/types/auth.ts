export interface User {
  id: number
  email: string
  full_name: string
  role: string
  is_active: boolean
  created_at: string
}

export interface TokenResponse {
  access_token: string
  refresh_token: string
  token_type: string
}

export interface DashboardStats {
  servers: number
  domains: number
  ssl_expiring: number
  alerts: number
  last_scan: string
}

export interface DNSRecord {
  type: string
  value: string
  priority: number | null
}

export interface DNSLookup {
  id: number
  domain: string
  created_at: string
  records: DNSRecord[]
}

export interface DNSLookupSummary {
  id: number
  domain: string
  created_at: string
  record_count: number
}
