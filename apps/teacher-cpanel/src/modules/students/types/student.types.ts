export type StudentStatus = 'active' | 'inactive'
export type StudentAttendanceType = 'in_person' | 'online_streaming' | 'hybrid_both'

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
  activeClasses: string[]
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
  classEnrollments?: Array<{
    status: string
    customPrice?: number | string | null
    studentAttendanceType: StudentAttendanceType
    studentClass: { id: number; className: string; monthlyPrice?: number | string | null }
  }>
  attendance?: Array<{
    id: number
    status: string
    recordedAt: string
    session?: {
      sessionDate: string
      scheduledStartTime?: string | null
      sessionType?: string
      topic?: string | null
      studentClass?: { className: string }
    }
  }>
  invoices?: Array<{
    id: number
    billingMonth: string
    amountDue: number | string
    amountPaid: number | string
    status: string
    studentClass?: { className: string }
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
  classIds?: number[]
  studentAttendanceType?: StudentAttendanceType
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
  classIds?: number[]
}
