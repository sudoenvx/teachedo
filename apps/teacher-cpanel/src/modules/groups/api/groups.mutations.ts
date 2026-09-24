import { useMutationAction } from '@/core/hooks/use_query_actions'
import type { ClassInput, ClassSessionInput } from '../types/group.types'

export function useCreateGroup() {
  return useMutationAction<unknown, ClassInput>({ method: 'post', url: '/classes', key: ['teacher-classes'] })
}

export function useUpdateGroup(id: number) {
  return useMutationAction<unknown, ClassInput>({ method: 'put', url: `/classes/${id}`, key: ['teacher-classes'] })
}

export function useDeleteGroup() {
  return useMutationAction<unknown, { id: number }>({ method: 'delete', url: ({ id }) => `/classes/${id}`, key: ['teacher-classes'] })
}

export function useCreateClassSession(classId: number) {
  return useMutationAction<unknown, ClassSessionInput>({
    method: 'post',
    url: `/classes/${classId}/sessions`,
    key: ['teacher-classes'],
  })
}
