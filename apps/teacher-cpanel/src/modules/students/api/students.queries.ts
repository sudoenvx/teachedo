import { useGetPaginatedQuery, useGetQuery } from '@/core/hooks/use_query_actions'
import type { StudentDetails, StudentListItem, StudentStats } from '../types/student.types'

export function useStudentsList(page: number, search?: string, status?: string, stageId?: string, groupId?: string) {
  return useGetPaginatedQuery<StudentListItem>({
    key: ['teacher-students', page, search, status, stageId, groupId],
    url: '/students',
    params: { page, perPage: 10, search: search || undefined, status: status || undefined, stageId: stageId || undefined, groupId: groupId || undefined },
  })
}

export function useStudent(studentId: number) {
  return useGetQuery<StudentDetails>({
    key: ['teacher-students', 'detail', studentId],
    url: `/students/${studentId}`,
    options: { enabled: Number.isFinite(studentId) },
  })
}

export function useStudentStats() {
  return useGetQuery<StudentStats>({
    key: ['teacher-students', 'stats'],
    url: '/students/stats',
  })
}