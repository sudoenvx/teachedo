import { isAxiosError } from 'axios'
import type { ApiFieldErrors, NormalizedApiError } from '../types/api'

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (isAxiosError(error)) {
    const response = error.response
    const data = response?.data
    return {
      kind: response ? (data?.errors ? 'validation' : 'global') : 'network',
      message: data?.message || error.message || 'تعذر إتمام الطلب.',
      fieldErrors: data?.errors || {},
      status: response?.status,
      cause: error,
    }
  }

  return {
    kind: 'unknown',
    message: error instanceof Error ? error.message : 'حدث خطأ غير متوقع.',
    fieldErrors: {},
    cause: error,
  }
}

export function flattenApiFieldErrors(fieldErrors: ApiFieldErrors): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([field, errors]) => [field, errors.map((error) => error.message).join(' ')])
  )
}