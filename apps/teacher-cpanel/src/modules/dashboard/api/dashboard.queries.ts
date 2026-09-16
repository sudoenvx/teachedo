import { useGetQuery } from '@/core/hooks/use_query_actions'
import type { TeacherDashboardStats, UpcomingSession } from '../types/dashboard.types'

export function useTeacherDashboardStats() {
  return useGetQuery<TeacherDashboardStats>({
    key: ['teacher-dashboard-stats'],
    url: '/dashboard/teacher/stats',
  })
}

export function useUpcomingTeacherSessions() {
  return useGetQuery<UpcomingSession[]>({
    key: ['teacher-upcoming-sessions'],
  url: '/dashboard/teacher/upcoming-sessions',
  })
}