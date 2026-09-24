import { useGetQuery } from '@/core/hooks/use_query_actions'
import type { TeacherUser } from '../types/auth.types'

export interface TeacherProfile extends TeacherUser {
  phoneNumber?: string | null
  subjectSpecialization?: string | null
  profilePictureUrl?: string | null
  mustChangePassword?: boolean
  famousName?: string | null
  teachingMode?: 'center' | 'institute' | 'both' | null
  customSubdomain?: string | null
  createdAt?: string
  onboardingRequired?: boolean
  joinDate?: string
  stats?: {
    totalStudents: number
    activeClasses: number
    totalSessions: number
  }
  studyStages?: Array<{ id: number; stageName: string }>
  classes?: Array<{ id: number; className: string }>
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

export function useTeacherSubdomainAvailability(subdomain: string) {
  return useGetQuery<{ subdomain: string; available: boolean }>({
    key: ['teacher-subdomain-availability', subdomain],
    url: '/auth/teacher/subdomain/availability',
    params: { subdomain },
    options: { enabled: subdomain.length >= 3 },
  })
}
