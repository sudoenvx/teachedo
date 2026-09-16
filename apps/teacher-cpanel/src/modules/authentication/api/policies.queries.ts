import { useGetQuery } from '@/core/hooks/use_query_actions'

export type OnboardingPolicy = {
  id: number
  key: string
  title: string
  content: string
  version: number
}

export function useOnboardingPolicy() {
  return useGetQuery<OnboardingPolicy>({
    key: ['policy', 'teacher-onboarding-terms'],
    url: '/policies/teacher_onboarding_terms',
  })
}
