import { useMutationAction } from '@/core/hooks/use_query_actions'
import type { CreateStudentInput, StudentCredentials, UpdateStudentInput } from '../types/student.types'

export function useCreateStudent() {
  return useMutationAction<unknown, CreateStudentInput & { profileImage?: File }>({
    method: 'post',
    url: '/students',
    key: ['teacher-students'],
    body: ({ profileImage, parent, ...values }) => {
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => {
        if (value !== undefined && value !== null) formData.append(key, String(value))
      })
      if (parent) formData.append('parent', JSON.stringify(parent))
      if (profileImage) formData.append('profileImage', profileImage)
      return formData
    },
  })
}

export function useUpdateStudent(studentId: number) {
  return useMutationAction<unknown, UpdateStudentInput & { profileImage?: File }>({
    method: 'put',
    url: `/students/${studentId}`,
    key: ['teacher-students'],
    body: ({ profileImage, ...values }) => {
      const formData = new FormData()
      Object.entries(values).forEach(([key, value]) => { if (value !== undefined && value !== null) formData.append(key, String(value)) })
      if (profileImage) formData.append('profileImage', profileImage)
      return formData
    },
  })
}

export function useDeleteStudent() {
  return useMutationAction<unknown, { id: number }>({ method: 'delete', url: ({ id }) => `/students/${id}`, key: ['teacher-students'] })
}

export function useRegenerateStudentCredentials() {
  return useMutationAction<StudentCredentials, { id: number }>({
    method: 'post',
    url: ({ id }) => `/students/${id}/regenerate-card`,
    key: ['teacher-students'],
  })
}