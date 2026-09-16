import { useGetPaginatedQuery } from '@/core/hooks/use_query_actions'

export interface TeacherListItem {
  id: number
  fullName: string
  email: string
  phoneNumber: string | null
  subjectSpecialization: string | null
  accountStatus: string
  studentsCount: number
  groupsCount: number
  createdAt: string
}

export function useTeachersList(page: number = 1, search?: string) {
  return useGetPaginatedQuery<TeacherListItem>({
    key: ['teachers', page, search],
    url: '/teachers', // تذكر بدون api/
    params: { page, search: search || undefined },
  })
}