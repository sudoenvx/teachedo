/**
 * Shared API response contracts.
 *
 * JSON success responses:
 * {
 *   success: true,
 *   message: string,
 *   data: TData,
 *   meta: TMeta
 * }
 *
 * Validation errors use an object keyed by field name. Global errors use
 * errors: null.
 */

import type { AxiosError } from "axios"

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

export interface ApiValidationErrorResponse<TMeta = null> {
  success: false
  message: string
  code: 'VALIDATION_ERROR' | string
  errors: ApiFieldErrors
  meta: TMeta | null
}

export interface ApiGlobalErrorResponse<TMeta = null> {
  success: false
  message: string
  code: string
  errors: null
  meta: TMeta | null
}

export type ApiAxiosError<TMeta = null> = AxiosError<ApiErrorResponse<TMeta>>

export type ApiErrorResponse<TMeta = null> =
  | ApiValidationErrorResponse<TMeta>
  | ApiGlobalErrorResponse<TMeta>

export type ApiResponse<TData, TMeta = null> =
  | ApiSuccessResponse<TData, TMeta>
  | ApiErrorResponse<TMeta>

export type NormalizedApiErrorKind = 'validation' | 'global' | 'network' | 'unknown'

export interface NormalizedApiError {
  kind: NormalizedApiErrorKind
  message: string
  code?: string
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

export type ApiListResponse<T> = ApiSuccessResponse<T[], null>

export type PaginatedApiResponse<T> = ApiSuccessResponse<T[], ApiPaginationMeta>

export interface PaginatedResult<T, TMeta = ApiPaginationMeta> {
  data: T[]
  meta: TMeta
}

export type ApiNullablePaginatedResponse<T> =
  | ApiSuccessResponse<T[], ApiPaginationMeta>
  | ApiSuccessResponse<T[], null>

export interface ApiUser {
  id: number
  name: string
  email: string
  role?: string | null
}

export interface LoginData<TUser = ApiUser> {
  user: TUser
  access_token: string
}

export type LoginResponse<TUser = ApiUser> = ApiSuccessResponse<LoginData<TUser>>



export type ApiMessageResponse = ApiSuccessResponse<null>
