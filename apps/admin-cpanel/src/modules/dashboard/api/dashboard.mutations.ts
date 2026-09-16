import { useMutationAction } from '@/core/hooks/use_query_actions'

export type AddTeacherPayload = {
  name: string
  phone: string
  email?: string
  subject: string
  pricePerStudent: number
}

// إضافة مدرس جديد
export function useAddTeacher() {
  return useMutationAction<void, AddTeacherPayload>({
    method: 'post',
    url: 'teachers',
    key: ['dashboard', 'latest-teachers']
  })
}