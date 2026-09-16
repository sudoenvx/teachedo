export type StudentStatus = 'active' | 'inactive'

export interface StudentListItem {
  id: number
  fullName: string
  studentCode: string | null
  plainPassword?: string | null
  phoneNumber: string | null
  profilePictureUrl: string | null
  status: StudentStatus | string
  stageName: string
  parentName?: string
  parentPhone?: string
  parentWhatsapp?: string
  activeGroups: string[]
  totalAttendance: number
  createdAt: string
}

export interface StudentDetails extends StudentListItem {
  teacher?: {
    id: number
    fullName: string
    subjectSpecialization?: string | null
    phoneNumber?: string | null
  }
  parent?: {
    id: number
    fullName: string
    phoneNumber: string
    whatsappNumber?: string | null
  } | null
  studyStage?: { id: number; stageName: string } | null
  groupEnrollments?: Array<{
    status: string
    customPrice?: number | string | null
    group: { id: number; groupName: string; standardMonthlyFee?: number | string | null }
  }>
  attendance?: Array<{
    id: number
    status: string
    recordedAt: string
    session?: { sessionDate: string; topic?: string | null; group?: { groupName: string } }
  }>
  invoices?: Array<{
    id: number
    billingMonth: string
    amountDue: number | string
    amountPaid: number | string
    status: string
    group?: { groupName: string }
  }>
  payments?: Array<{
    id: number
    amount: number | string
    paymentMethod?: string | null
    paidAt: string
    receiptNote?: string | null
  }>
}

export interface StudentCredentials {
  studentCode: string
  newPassword: string
}

export interface StudentStats {
  total: number
  active: number
  inactive: number
  withParent: number
}

export interface CreateStudentInput {
  fullName: string
  phoneNumber?: string | null
  profilePictureUrl?: string | null
  status: StudentStatus
  studentCode?: string | null
  password?: string | null
  profileImage?: File
  groupId?: number | null
  customPrice?: number | null
  parent?: {
    fullName: string
    phoneNumber: string
    whatsappNumber?: string | null
    password?: string | null
  }
}

export interface UpdateStudentInput {
  fullName: string
  phoneNumber?: string | null
  profilePictureUrl?: string | null
  status: StudentStatus
  studentCode?: string | null
  password?: string | null
  profileImage?: File
  groupId?: number | null
  customPrice?: number | null
}