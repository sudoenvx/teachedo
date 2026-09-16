import { useGetQuery } from '@/core/hooks/use_query_actions'

export interface AdminProfile {
  id: number
  name: string
  email: string
  role: string
  createdAt: string
}

export function useAdminMe() {
  return useGetQuery<AdminProfile>({
    key: ['admin', 'me'],
    url: '/admin/me',
  })
}
