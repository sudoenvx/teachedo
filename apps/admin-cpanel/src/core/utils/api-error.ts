import { isAxiosError } from 'axios'
import type {
  ApiAxiosError,
  ApiErrorResponse,
  ApiFieldErrors,
  NormalizedApiError,
} from '../types/api'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function isApiFieldErrors(value: unknown): value is ApiFieldErrors {
  if (!isRecord(value)) return false

  return Object.values(value).every(
    (fieldErrors) =>
      Array.isArray(fieldErrors) &&
      fieldErrors.every(
        (fieldError) =>
          isRecord(fieldError) &&
          typeof fieldError.code === 'string' &&
          typeof fieldError.message === 'string',
      ),
  )
}

export function isApiErrorResponse(value: unknown): value is ApiErrorResponse {
  if (!isRecord(value)) return false
  if (value.success !== false) return false
  if (typeof value.message !== 'string' || typeof value.code !== 'string') return false

  return value.errors === null || isApiFieldErrors(value.errors)
}

export function isApiAxiosError(error: unknown): error is ApiAxiosError {
  return isAxiosError(error) && error.response !== undefined && isApiErrorResponse(error.response.data)
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (isApiAxiosError(error) && error.response) {
    const response = error.response
    const data = response.data

    return {
      kind: data.errors === null ? 'global' : 'validation',
      message: data.message,
      code: data.code,
      fieldErrors: data.errors ?? {},
      status: response.status,
      cause: error,
    }
  }

  if (isAxiosError(error)) {
    return {
      kind: 'network',
      message: error.message || 'The request could not be completed.',
      fieldErrors: {},
      status: error.response?.status,
      cause: error,
    }
  }

  if (error instanceof Error) {
    return {
      kind: 'unknown',
      message: error.message,
      fieldErrors: {},
      cause: error,
    }
  }

  return {
    kind: 'unknown',
    message: 'Something went wrong. Please try again.',
    fieldErrors: {},
    cause: error,
  }
}

export function flattenApiFieldErrors(fieldErrors: ApiFieldErrors): Record<string, string> {
  return Object.fromEntries(
    Object.entries(fieldErrors).map(([field, errors]) => [
      field,
      errors.map((error) => error.message).join(' '),
    ]),
  )
}
