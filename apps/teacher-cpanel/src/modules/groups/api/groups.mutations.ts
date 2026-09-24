import { useMutationAction } from '@/core/hooks/use_query_actions'
import { useQueryClient } from '@tanstack/react-query'
import type { ClassInput, ClassSessionInput, StudentAttendanceType } from '../types/group.types'

export function useCreateGroup() {
  return useMutationAction<unknown, ClassInput>({ method: 'post', url: '/classes', key: ['teacher-classes'] })
}

export function useUpdateGroup(id: number) {
  return useMutationAction<unknown, ClassInput>({ method: 'put', url: `/classes/${id}`, key: ['teacher-classes'] })
}

export function useDeleteGroup() {
  return useMutationAction<unknown, { id: number }>({ method: 'delete', url: ({ id }) => `/classes/${id}`, key: ['teacher-classes'] })
}

export function useCreateClassSession(classId: number) {
  const queryClient = useQueryClient()
  return useMutationAction<unknown, ClassSessionInput>({
    method: 'post',
    url: `/classes/${classId}/sessions`,
    key: ['teacher-class-sessions'],
    onSuccessCallback: () => {
      void queryClient.invalidateQueries({ queryKey: ['teacher-classes'] })
    },
  })
}

export function useRescheduleClassSession() {
  return useMutationAction<unknown, { classId: number; sessionId: number; sessionDate: string; scheduledStartTime?: string | null }>({
    method: 'patch',
    url: ({ classId, sessionId }) => `/classes/${classId}/sessions/${sessionId}`,
    key: ['teacher-class-sessions'],
  })
}

export function useStartClassSession(classId: number, sessionId: number) {
  return useMutationAction<unknown, void>({
    method: 'post',
    url: `/classes/${classId}/sessions/${sessionId}/start`,
    key: ['teacher-live-session', classId, sessionId],
  })
}

export function useRecordClassSessionAttendance(classId: number, sessionId: number) {
  return useMutationAction<unknown, { studentId?: number; studentCode?: string; status?: 'present' | 'absent' | 'late' | 'excused'; excuseReason?: string | null }>({
    method: 'post',
    url: `/classes/${classId}/sessions/${sessionId}/attendance`,
    key: ['teacher-live-session', classId, sessionId],
  })
}

export type { StudentAttendanceType }
