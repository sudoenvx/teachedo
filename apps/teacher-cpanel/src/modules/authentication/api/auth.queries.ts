import { useGetQuery } from '@/core/hooks/use_query_actions'
import type { TeacherUser } from '../types/auth.types'

export interface TeacherProfile extends TeacherUser {
  phoneNumber?: string | null
  subjectSpecialization?: string | null
  profilePictureUrl?: string | null
  createdAt?: string
  onboardingRequired?: boolean
  joinDate?: string
  stats?: {
    totalStudents: number
    activeGroups: number
    totalSessions: number
  }
  studyStages?: Array<{ id: number; stageName: string }>
  groups?: Array<{ id: number; groupName: string }>
}

export function useTeacherMe() {
  return useGetQuery<TeacherProfile>({
    key: ['teacher-me'],
    url: '/auth/teacher/me',
  })
}

export type TeacherSubject = { id: number; name: string; icon: string; ordering: number }

export function useTeacherSubjects() {
  return useGetQuery<TeacherSubject[]>({
    key: ['subjects', 'active'],
    url: '/subjects',
    params: { activeOnly: true },
  })
}