import { useMutationAction } from '@/core/hooks/use_query_actions'
import type { CreateTeacherFormValues } from '../schemas/teachers.schemas'

export function useAddTeacher() {
  return useMutationAction<void, CreateTeacherFormValues & { profileImage?: File }>({
    method: 'post',
    url: '/teachers',
    key: ['teachers'],
    body: ({ profileImage, ...values }) => {
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, String(value))
      })
      if (profileImage) formData.append('profileImage', profileImage)
      return formData
    },
  })
}

export function useUpdateTeacher(teacherId: string | number) {
  return useMutationAction<void, Partial<CreateTeacherFormValues>>({
    method: 'put',
    url: `/teachers/${teacherId}`,
    key: ['teachers', 'profile', teacherId],
  })
}

export function useUpdateTeacherStatus(teacherId: string | number) {
  return useMutationAction<void, { accountStatus: string }>({
    method: 'patch',
    url: `/teachers/${teacherId}/status`,
    key: ['teachers', 'profile', teacherId],
  })
}

export function useDeleteTeacher() {
  return useMutationAction<void, { id: string | number }>({
    method: 'delete',
    url: (data) => `/teachers/${data.id}`,
    key: ['teachers'],
  })
}