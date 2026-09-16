import { useMutationAction } from '@/core/hooks/use_query_actions'
import type { GroupInput } from '../types/group.types'

export function useCreateGroup() {
  return useMutationAction<unknown, GroupInput>({ method: 'post', url: '/groups', key: ['teacher-groups'] })
}

export function useUpdateGroup(id: number) {
  return useMutationAction<unknown, GroupInput>({ method: 'put', url: `/groups/${id}`, key: ['teacher-groups'] })
}

export function useDeleteGroup() {
  return useMutationAction<unknown, { id: number }>({ method: 'delete', url: ({ id }) => `/groups/${id}`, key: ['teacher-groups'] })
}