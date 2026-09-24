import { useGetQuery } from '@/core/hooks/use_query_actions'
import type { ClassListItem, LiveSession, ScheduledSession } from '../types/group.types'

export function useGroups() {
  return useGetQuery<ClassListItem[]>({ key: ['teacher-classes'], url: '/classes' })
}

export function useGroup(id: number) {
  return useGetQuery<ClassListItem>({ key: ['teacher-classes', id], url: `/classes/${id}`, options: { enabled: Number.isFinite(id) } })
}

export function useClassSessions(from?: string, to?: string, options?: { refetchInterval?: number }) {
  return useGetQuery<ScheduledSession[]>({
    key: ['teacher-class-sessions', from, to],
    url: '/classes/sessions',
    params: { from, to },
    options,
  })
}

export function useLiveClassSession(classId: number, sessionId: number) {
  return useGetQuery<LiveSession>({
    key: ['teacher-live-session', classId, sessionId],
    url: `/classes/${classId}/sessions/${sessionId}/live`,
    options: { enabled: Number.isFinite(classId) && Number.isFinite(sessionId), refetchInterval: 10_000 },
  })
}
