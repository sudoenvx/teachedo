import { useGetQuery } from '@/core/hooks/use_query_actions'
import type { AssistantUser } from '../types/auth.types'

export function useAssistantMe() {
  return useGetQuery<AssistantUser>({ key: ['assistant-me'], url: '/auth/assistant/me' })
}