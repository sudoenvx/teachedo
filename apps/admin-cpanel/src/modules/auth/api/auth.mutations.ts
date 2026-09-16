import { useMutationAction } from '@/core/hooks/use_query_actions'
import type { LoginResponse } from '../types/auth.types'
import type { AdminLoginFormValues } from '@/modules/auth/schemas/auth.schema'

export function useAdminLogin() {
  return useMutationAction<LoginResponse, AdminLoginFormValues>({
    method: 'post',
    url: '/auth/admin/login'
  })
}

export function useAdminLogout() {
  return useMutationAction<void, void>({
    method: 'post',
    url: '/auth/admin/logout'
  })
}
