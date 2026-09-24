export type GroupTier = 'normal' | 'vip'
export type DeliveryMode = 'offline' | 'online' | 'hybrid'
export type SessionType = 'regular' | 'extra_revision' | 'final_revision' | 'quiz_only' | 'mock_exam' | 'assessment' | 'other'
export type StudentAttendanceType = 'in_person' | 'online_streaming' | 'hybrid_both'

export interface ClassListItem {
  id: number
  className: string
  gradeLevel: string
  sessionPrice: number | string | null
  monthlyPrice: number | string | null
  center?: { id: number; name: string; location?: string | null; area?: string | null } | null
  maxCapacity: number | null
  groupTier: GroupTier
  deliveryMode: DeliveryMode
  _count: { enrollments: number; classSessions: number }
  createdAt: string
  enrollments?: ClassEnrollment[]
  classSessions?: ClassSession[]
}

export interface ClassInput {
  className: string
  gradeLevel: string
  centerId?: number | null
  sessionPrice?: number | null
  monthlyPrice?: number | null
  maxCapacity?: number | null
  groupTier?: GroupTier
  deliveryMode?: DeliveryMode
}

export interface ClassEnrollment {
  status: string
  enrollmentDate?: string | null
  customPrice?: number | string | null
  studentAttendanceType: StudentAttendanceType
  student: {
    id: number
    fullName: string
    studentCode?: string | null
    phoneNumber?: string | null
    profilePictureUrl?: string | null
    status?: string | null
    studyStage?: { stageName: string } | null
  }
}

export interface ClassSession {
  id: number
  sessionDate: string
  sessionType: SessionType
  scheduledStartTime?: string | null
  durationMinutes: number
  isMandatory: boolean
  topic?: string | null
  status?: string | null
  isCompleted: boolean
  attendance: Array<{ studentId: number; status?: string | null }>
}

export interface ClassSessionInput {
  sessionDate: string
  sessionType: SessionType
  scheduledStartTime?: string | null
  durationMinutes: number
  isMandatory: boolean
  topic?: string | null
}

export type GroupListItem = ClassListItem
export type GroupInput = ClassInput
export type GroupEnrollment = ClassEnrollment
export type GroupSession = ClassSession
