import { useGetQuery } from '@/core/hooks/use_query_actions'
import type { AdminDashboardOverview, AdminDashboardStats, LatestTeacher } from '../types/dashboard.types'

export function useAdminStats(month?: string) {
  return useGetQuery<AdminDashboardStats>({
    key: ['admin-stats', month],
    url: '/dashboard/stats', // اعتماداً على الـ routes الخاصة بك
    params: { month },
  })
}

export function useLatestTeachers() {
  return useGetQuery<LatestTeacher[]>({
    key: ['latest-teachers'],
    url: '/teachers/latest',
  })
}

export function useAdminDashboardOverview() {
  return useGetQuery<AdminDashboardOverview>({
    key: ['admin-dashboard-overview'],
    url: '/dashboard/overview',
  })
}