import type { AxiosError } from 'axios'

export interface ApiSuccessResponse<TData, TMeta = null> {
  success: true
  message: string
  data: TData
  meta: TMeta
}

export interface ApiFieldError {
  code: string
  message: string
}

export type ApiFieldErrors = Record<string, ApiFieldError[]>

export interface ApiErrorResponse {
  success: false
  message: string
  code: string
  errors: ApiFieldErrors | null
}

export type ApiAxiosError = AxiosError<ApiErrorResponse>
export type NormalizedApiError = {
  kind: 'validation' | 'global' | 'network' | 'unknown'
  message: string
  fieldErrors: ApiFieldErrors
  status?: number
  cause?: unknown
}

export interface ApiPaginationMeta {
  current_page: number
  per_page: number
  total: number
  last_page: number
  from: number | null
  to: number | null
  path: string
  first_page_url: string
  last_page_url: string
  next_page_url: string | null
  prev_page_url: string | null
}
export type PaginatedResult<T, TMeta = ApiPaginationMeta> = { data: T[]; meta: TMeta }