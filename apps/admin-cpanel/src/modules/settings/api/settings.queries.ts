import { useGetQuery } from '@/core/hooks/use_query_actions'
import type { SystemSettings } from '../types/settings.types'

export function useGetSettings() {
  return useGetQuery<SystemSettings>({
    key: ['settings'],
    url: '/settings',
  })
}

export function useGetSettingsGroup(group: string) {
  return useGetQuery<{ group: string; settings: Record<string, unknown> }>({
    key: ['settings', group],
    url: `/settings/group/${group}`,
  })
}