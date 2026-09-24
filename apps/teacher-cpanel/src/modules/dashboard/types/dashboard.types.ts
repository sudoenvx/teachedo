export interface TeacherDashboardStats {
  totalStudents: number
  activeClasses: number
  totalSessions: number
  sessionsThisMonth: number
  revenueThisMonth: number
  pendingInvoices: number
}

export interface UpcomingSession {
  id: number
  sessionDate: string
  sessionType: string
  scheduledStartTime: string | null
  durationMinutes: number
  isMandatory: boolean
  topic: string | null
  status: string | null
  studentClass: { className: string }
}
