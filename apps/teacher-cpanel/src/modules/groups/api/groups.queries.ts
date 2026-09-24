import { useGetQuery } from '@/core/hooks/use_query_actions'
import type { ClassListItem } from '../types/group.types'

export function useGroups() {
  return useGetQuery<ClassListItem[]>({ key: ['teacher-classes'], url: '/classes' })
}

export function useGroup(id: number) {
  return useGetQuery<ClassListItem>({ key: ['teacher-classes', id], url: `/classes/${id}`, options: { enabled: Number.isFinite(id) } })
}