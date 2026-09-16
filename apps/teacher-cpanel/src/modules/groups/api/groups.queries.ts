import { useGetQuery } from '@/core/hooks/use_query_actions'
import type { GroupListItem } from '../types/group.types'

export function useGroups() {
  return useGetQuery<GroupListItem[]>({ key: ['teacher-groups'], url: '/groups' })
}

export function useGroup(id: number) {
  return useGetQuery<GroupListItem>({ key: ['teacher-groups', id], url: `/groups/${id}`, options: { enabled: Number.isFinite(id) } })
}