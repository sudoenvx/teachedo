export interface GroupListItem {
  id: number
  groupName: string
  standardMonthlyFee: number | string | null
  maxCapacity: number | null
  studyStage?: { id: number; stageName: string } | null
  _count: { enrollments: number; classSessions: number }
  createdAt: string
  schedules?: GroupSchedule[]
  enrollments?: GroupEnrollment[]
  classSessions?: GroupSession[]
}

export interface GroupSchedule {
  id?: number
  dayOfWeek: string
  startTime: string
  endTime: string
}

export interface GroupInput {
  groupName: string
  studyStageId?: number | null
  standardMonthlyFee?: number | null
  maxCapacity?: number | null
  schedules?: GroupSchedule[]
}

export interface GroupEnrollment {
  status: string
  enrollmentDate?: string | null
  customPrice?: number | string | null
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

export interface GroupSession {
  id: number
  sessionDate: string
  startTime?: string | null
  topic?: string | null
  status?: string | null
  isCompleted: boolean
  attendance: Array<{ studentId: number; status?: string | null }>
}