import { useGetPaginatedQuery, useGetQuery, useMutationAction } from '@/core/hooks/use_query_actions'

export type Permission = { id: number; key: string; label: string | null }
export type Assistant = { id: number; fullName: string; username: string; email: string | null; phoneNumber: string | null; permissions: string[]; createdAt: string }
export type AssistantInput = { fullName: string; username: string; email?: string | null; password?: string; phoneNumber?: string | null; permissionKeys: string[] }

export function useAssistants(page = 1, search?: string) {
  return useGetPaginatedQuery<Assistant>({ key: ['assistants', page, search], url: '/assistants', params: { page, perPage: 20, search: search || undefined } })
}
export function useAssistant(id: number) {
  return useGetQuery<Assistant & { permissions: Permission[] }>({ key: ['assistants', id], url: `/assistants/${id}`, options: { enabled: Number.isFinite(id) } })
}
export function usePermissionCatalog() {
  return useGetQuery<Permission[]>({ key: ['assistant-permissions'], url: '/assistants/permissions-catalog' })
}
export function useCreateAssistant() {
  return useMutationAction<Assistant, AssistantInput>({ method: 'post', url: '/assistants', key: ['assistants'] })
}
export function useUpdateAssistant(id: number) {
  return useMutationAction<Assistant, Partial<AssistantInput>>({ method: 'put', url: `/assistants/${id}`, key: ['assistants'] })
}
export function useDeleteAssistant() {
  return useMutationAction<unknown, { id: number }>({ method: 'delete', url: ({ id }) => `/assistants/${id}`, key: ['assistants'] })
}
