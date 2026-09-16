import { useGetQuery } from '@/core/hooks/use_query_actions'
import type { TeacherProfileDetails } from '../types/teacher-profile.types'

export function useTeacherProfile(teacherId: string | number) {
  return useGetQuery<TeacherProfileDetails>({
    key: ['teachers', 'profile', teacherId],
    url: `/teachers/${teacherId}`,
    options: {
      enabled: !!teacherId,
    },
  })
}