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

export interface SSLCheck {
  id: number
  domain: string
  is_valid: boolean
  days_left: number
  issuer: string | null
  subject: string | null
  serial_number: string | null
  tls_version: string | null
  signature_algorithm: string | null
  expires_at: string | null
  error: string | null
  created_at: string
}

export interface WhoisCheck {
  id: number
  domain: string
  registrar: string | null
  status: string | null
  creation_date: string | null
  expiration_date: string | null
  updated_date: string | null
  name_servers: string | null
  error: string | null
  created_at: string
}

export interface FileHash {
  id: number
  filename: string
  sha256: string
  sha512: string
  md5: string
  size_bytes: number
  created_at: string
}

export interface PasswordCheck {
  id: number
  password_length: number
  entropy_bits: number
  has_lower: boolean
  has_upper: boolean
  has_digit: boolean
  has_special: boolean
  in_dictionary: boolean
  crack_time_seconds: number
  score: number
  created_at: string
}

export interface JwtInspection {
  id: number
  algorithm: string | null
  subject: string | null
  issuer: string | null
  audience: string | null
  expires_at: string | null
  issued_at: string | null
  payload_json: string | null
  warnings: string | null
  error: string | null
  created_at: string
}

export interface NotificationItem {
  id: number
  title: string
  message: string
  kind: string
  read: boolean
  created_at: string
}

export interface ActivityLogItem {
  id: number
  action: string
  detail: string
  ip: string | null
  created_at: string
}

export interface CompareDNSResult {
  domain: string
  latest_at: string
  previous_at: string | null
  added_records: string[]
  removed_records: string[]
  record_count_now: number
  record_count_before: number
}

export interface CompareSSLResult {
  domain: string
  latest_at: string
  previous_at: string | null
  days_left_now: number | null
  days_left_before: number | null
  expires_at_now: string | null
  expires_at_before: string | null
  is_valid_now: boolean | null
  is_valid_before: boolean | null
}
