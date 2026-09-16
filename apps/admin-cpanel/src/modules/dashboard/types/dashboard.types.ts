export interface AdminDashboardStats {
  activeTeachers: number
  totalTeachers: number
  activeTeachersGrowth: number
  enrolledStudents: number
  enrolledStudentsGrowth: number
  activeGroups: number
  monthlyRevenue: number
  systemHealth: number
  currentMonth: string
  billingSummary: {
    totalBilled: number
    totalCollected: number
  }
}

export interface LatestTeacher {
  id: string
  name: string
  email: string
  subject: string
  studentsCount: number
  status: 'ACTIVE' | 'TRIAL' | 'EXPIRED' | 'INACTIVE' | 'SUSPENDED_PAYMENT' | string
  joinDate: string
}

export interface AdminDashboardOverview {
  revenueHistory: Array<{ month: string; amount: number }>
  cashFlow: { outstanding: number; overdueTeachers: number }
  topTeachers: Array<{ id: number; name: string; subject: string; studentsCount: number }>
}