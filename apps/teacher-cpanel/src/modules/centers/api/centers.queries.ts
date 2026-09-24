import { useGetQuery } from '@/core/hooks/use_query_actions'
import type { Center } from '../types/center.types'

export function useCenters() {
  return useGetQuery<Center[]>({ key: ['teacher-centers'], url: '/centers' })
}

export function useCenter(id: number) {
  return useGetQuery<Center>({ key: ['teacher-centers', id], url: `/centers/${id}`, options: { enabled: Number.isFinite(id) } })
}