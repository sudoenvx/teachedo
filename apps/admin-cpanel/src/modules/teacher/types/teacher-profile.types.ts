export type TeacherAccountStatus = 'active' | 'suspended_payment' | 'inactive' | 'trial' | string

export interface StudyStageItem {
  id: number
  stageName: string
  orderingIndex: number | null
  _count: { students: number; groups: number }
}

export interface GroupItem {
  id: number
  groupName: string
  standardMonthlyFee: number | null
  maxCapacity: number | null
  _count: { enrollments: number }
}

export interface InvoiceItem {
  id: string
  month: string
  amount: number
  amountPaid: number
  isPaid: boolean
  status: string
}

export interface PaymentItem {
  id: number
  amount: number
  paymentMethod: string
  transactionReference: string | null
  status: string
  paidAt: string
}

export interface TeacherProfileDetails {
  id: number
  name: string
  fullName: string
  email: string
  phone: string | null
  phoneNumber: string | null
  subject: string | null
  subjectSpecialization: string | null
  status: string
  accountStatus: TeacherAccountStatus
  profilePictureUrl: string | null
  joinDate: string
  createdAt: string
  
  stats: {
    totalStudents: number
    activeGroups: number
    totalAssistants: number
    totalSessions: number
  }

  studyStages: StudyStageItem[]
  groups: GroupItem[]
  recentInvoices: InvoiceItem[]
  recentPayments: PaymentItem[]
}