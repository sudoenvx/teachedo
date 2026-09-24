import { useMutationAction } from '@/core/hooks/use_query_actions'
import type { TeacherLoginFormValues } from '../schema/teacher.schema'
import type { TeacherLoginResponse } from '../types/auth.types'
import type { AssistantLoginResponse } from '../types/auth.types'

export function useTeacherLogin() {
  return useMutationAction<TeacherLoginResponse, TeacherLoginFormValues>({ method: 'post', url: '/auth/teacher/login' })
}

export type ChangeTeacherPasswordPayload = {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export function useChangeTeacherPassword() {
  return useMutationAction<null, ChangeTeacherPasswordPayload>({ method: 'patch', url: '/auth/teacher/password', key: ['teacher-me'] })
}

export function useTeacherLogout() {
  return useMutationAction<null, void>({ method: 'post', url: '/auth/teacher/logout' })
}

export type TeacherOnboardingPayload = {
  fullName: string
  username: string
  email?: string | null
  phoneNumber?: string | null
  subjectSpecialization?: string | null
  subjectIds: number[]
  subjectId: number
  customSubjects: string[]
  stages: Array<{ stageGroup: 'primary' | 'preparatory' | 'secondary'; gradeNumber: number }>
  famousName?: string | null
  teachingMode: 'center' | 'institute' | 'both'
  customSubdomain: string
  policyKey: string
  policyVersion: number
  profileImage?: File
}

export function useCompleteTeacherOnboarding() {
  return useMutationAction<unknown, TeacherOnboardingPayload>({
    method: 'patch',
    url: '/auth/teacher/onboarding',
    key: ['teacher-me'],
    body: ({ profileImage, ...values }) => {
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') return
        formData.append(key, Array.isArray(value) ? JSON.stringify(value) : String(value))
      })
      if (profileImage) formData.append('profileImage', profileImage)
      return formData
    },
  })
}

export function useAssistantLogin() {
  return useMutationAction<AssistantLoginResponse, { username: string; password: string }>({ method: 'post', url: '/auth/assistant/login' })
}

export function useAssistantLogout() {
  return useMutationAction<null, void>({ method: 'post', url: '/auth/assistant/logout' })
}
