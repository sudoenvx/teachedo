export interface SystemSettings {
  // Billing & SaaS Model
  price_per_student: number
  currency: string
  trial_days: number
  billing_cycle_days: number
  grace_period_days: number
  auto_suspend_unpaid: boolean

  // General & Business
  business_name: string
  support_email: string
  support_phone: string
  default_language: string

  // Security & Notifications
  notify_on_payment_overdue: boolean
  weekly_system_report: boolean
}

export interface SettingsRawItem {
  id: number
  group: string
  key: string
  value: unknown
  isEncrypted: boolean
  updatedAt: string
}

export interface SettingsResponse {
  settings: SystemSettings
  grouped: Record<string, Record<string, unknown>>
  raw: SettingsRawItem[]
}