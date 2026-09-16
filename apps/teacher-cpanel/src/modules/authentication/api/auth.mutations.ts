import { useMutationAction } from '@/core/hooks/use_query_actions'
import type { TeacherLoginFormValues } from '../schema/teacher.schema'
import type { TeacherLoginResponse } from '../types/auth.types'
import type { AssistantLoginResponse } from '../types/auth.types'

export function useTeacherLogin() {
  return useMutationAction<TeacherLoginResponse, TeacherLoginFormValues>({ method: 'post', url: '/auth/teacher/login' })
}

export function useTeacherLogout() {
  return useMutationAction<null, void>({ method: 'post', url: '/auth/teacher/logout' })
}

export type TeacherOnboardingPayload = {
  fullName: string
  phoneNumber?: string | null
  subjectSpecialization?: string | null
  subjectId: number
  stages: Array<{ stageGroup: 'primary' | 'preparatory' | 'secondary'; gradeNumber: number }>
  policyKey: string
  policyVersion: number
}

export function useCompleteTeacherOnboarding() {
  return useMutationAction<unknown, TeacherOnboardingPayload>({ method: 'patch', url: '/auth/teacher/onboarding', key: ['teacher-me'] })
}

export function useAssistantLogin() {
  return useMutationAction<AssistantLoginResponse, { username: string; password: string }>({ method: 'post', url: '/auth/assistant/login' })
}

export function useAssistantLogout() {
  return useMutationAction<null, void>({ method: 'post', url: '/auth/assistant/logout' })
}