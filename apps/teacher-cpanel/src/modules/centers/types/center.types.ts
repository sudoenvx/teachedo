export type CommissionType = 'percentage' | 'fixed_per_student' | 'none'

export interface Center {
  id: number
  name: string
  location: string | null
  area: string | null
  phoneNumber: string | null
  commission: number | string | null
  commissionType: CommissionType
  _count?: { classes: number }
  classes?: CenterClass[]
  analytics?: {
    currentMonthIncome: number
    currentMonthCommission: number
    year: Array<{ month: number; income: number; commission: number }>
    month: Array<{ day: number; income: number; commission: number }>
  }
}

export interface CenterClass {
  id: number
  className: string
  gradeLevel: string
  sessionPrice: number | string | null
  monthlyPrice: number | string | null
  maxCapacity: number | null
  _count: { enrollments: number }
}

export interface CenterInput {
  name: string
  location?: string | null
  area?: string | null
  phoneNumber?: string | null
  commission?: number | null
  commissionType: CommissionType
}