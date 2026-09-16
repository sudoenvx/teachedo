import { useMutationAction } from '@/core/hooks/use_query_actions'

export function useEnrollStudent(studentId: number) {
  return useMutationAction<unknown, { groupId: number; customPrice?: number | null }>({
    method: 'post',
    url: `/students/${studentId}/enroll`,
    key: ['teacher-students', 'detail', studentId],
  })
}