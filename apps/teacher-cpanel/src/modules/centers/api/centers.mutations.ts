import { useMutationAction } from '@/core/hooks/use_query_actions'
import type { CenterInput } from '../types/center.types'

export function useCreateCenter() {
  return useMutationAction<unknown, CenterInput>({ method: 'post', url: '/centers', key: ['teacher-centers'] })
}

export function useUpdateCenter(id: number) {
  return useMutationAction<unknown, Partial<CenterInput>>({ method: 'put', url: `/centers/${id}`, key: ['teacher-centers'] })
}

export function useDeleteCenter() {
  return useMutationAction<unknown, { id: number }>({ method: 'delete', url: ({ id }) => `/centers/${id}`, key: ['teacher-centers'] })
}