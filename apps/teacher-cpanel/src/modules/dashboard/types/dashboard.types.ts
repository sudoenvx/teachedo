export interface TeacherDashboardStats {
  totalStudents: number
  activeGroups: number
  totalSessions: number
  sessionsThisMonth: number
  revenueThisMonth: number
  pendingInvoices: number
}

export interface UpcomingSession {
  id: number
  sessionDate: string
  startTime: string | null
  topic: string | null
  status: string | null
  group: { groupName: string }
}