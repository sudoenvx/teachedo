import { useMutationAction } from '@/core/hooks/use_query_actions'
import type { SettingsResponse, SystemSettings } from '../types/settings.types'

export function useUpdateSettings() {
  return useMutationAction<SettingsResponse, Partial<SystemSettings>>({
    method: 'put',
    url: '/settings',
    key: ['settings'],
    body: (variables) => variables,
  })
}