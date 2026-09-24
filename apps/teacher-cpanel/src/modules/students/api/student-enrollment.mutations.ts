import { useMutationAction } from '@/core/hooks/use_query_actions'

export function useEnrollStudent(studentId: number) {
  return useMutationAction<unknown, { classId: number; studentAttendanceType?: StudentAttendanceType }>({
    method: 'post',
    url: `/students/${studentId}/enroll`,
    key: ['teacher-students', 'detail', studentId],
  })
}

export type StudentAttendanceType = 'in_person' | 'online_streaming' | 'hybrid_both'
