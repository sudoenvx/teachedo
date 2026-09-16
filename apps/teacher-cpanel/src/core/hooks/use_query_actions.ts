import {
  useMutation,
  useQuery,
  useQueryClient,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
  type UseQueryResult,
} from '@tanstack/react-query'
import { useAxios } from '../../lib/axios'
import type {
  ApiPaginationMeta,
  ApiSuccessResponse,
  NormalizedApiError,
  PaginatedResult,
} from '../types/api'
import { normalizeApiError } from '@/core/utils/api-error'

interface QueryProps<
  TQueryFnData,
  TTransformedData = TQueryFnData,
> {
  key: QueryKey
  url: string
  options?: Omit<
    UseQueryOptions<TQueryFnData, NormalizedApiError, TTransformedData>,
    'queryKey' | 'queryFn'
  >
  headers?: Record<string, string | undefined>
  params?: object
  onErrorCallback?: (error: NormalizedApiError) => void
}

interface PaginatedQueryProps<
  TQueryFnData,
  TTransformedData = TQueryFnData,
  TMeta = ApiPaginationMeta,
> {
  key: QueryKey
  url: string
  options?: Omit<
    UseQueryOptions<
      PaginatedResult<TQueryFnData, TMeta>,
      NormalizedApiError,
      PaginatedResult<TTransformedData, TMeta>
    >,
    'queryKey' | 'queryFn'
  >
  headers?: Record<string, string | undefined>
  params?: object
  onErrorCallback?: (error: NormalizedApiError) => void
}

interface MutationProps<TData = unknown, TVariables = void> {
  method: 'post' | 'put' | 'delete' | 'patch'
  url: string | ((variables: TVariables) => string)
  onSuccessMessage?: string
  key?: QueryKey
  options?: UseMutationOptions<TData, NormalizedApiError, TVariables>
  headers?: Record<string, string | undefined>
  contentType?: 'application/json' | 'multipart/form-data'
  body?: (variables: TVariables) => unknown
  onErrorCallback?: (error: NormalizedApiError) => void
  onSuccessCallback?: (data: TData) => void
}

/** GET a normal API resource and return the envelope's data property. */
export function useGetQuery<
  TQueryFnData = unknown,
  TTransformedData = TQueryFnData,
  TResponse extends ApiSuccessResponse<TQueryFnData> = ApiSuccessResponse<TQueryFnData>,
>({
  key,
  url,
  options = {},
  headers = {},
  params,
  onErrorCallback,
}: QueryProps<TQueryFnData, TTransformedData>): UseQueryResult<
  TTransformedData,
  NormalizedApiError
> {
  const axios = useAxios()

  const queryOptions: UseQueryOptions<
    TQueryFnData,
    NormalizedApiError,
    TTransformedData
  > = {
    queryKey: key,
    queryFn: async () => {
      try {
        const response = await axios.get<TResponse>(url, {
          headers,
          params,
        })
        return response.data.data
      } catch (error) {
        const normalizedError = normalizeApiError(error)
        onErrorCallback?.(normalizedError)
        throw normalizedError
      }
    },
    ...options,
  }

  return useQuery(queryOptions)
}

/** GET a paginated resource and preserve both records and pagination meta. */
export function useGetPaginatedQuery<
  TQueryFnData = unknown,
  TTransformedData = TQueryFnData,
  TMeta = ApiPaginationMeta,
  TResponse extends ApiSuccessResponse<TQueryFnData[], TMeta> = ApiSuccessResponse<TQueryFnData[], TMeta>,
>({
  key,
  url,
  options = {},
  headers = {},
  params,
  onErrorCallback,
}: PaginatedQueryProps<TQueryFnData, TTransformedData, TMeta>): UseQueryResult<
  PaginatedResult<TTransformedData, TMeta>,
  NormalizedApiError
> {
  const axios = useAxios()

  const queryOptions: UseQueryOptions<
    PaginatedResult<TQueryFnData, TMeta>,
    NormalizedApiError,
    PaginatedResult<TTransformedData, TMeta>
  > = {
    queryKey: key,
    queryFn: async () => {
      try {
        const response = await axios.get<TResponse>(url, {
          headers,
          params,
        })

        return {
          data: response.data.data,
          meta: response.data.meta,
        }
      } catch (error) {
        const normalizedError = normalizeApiError(error)
        onErrorCallback?.(normalizedError)
        throw normalizedError
      }
    },
    ...options,
  }

  return useQuery(queryOptions)
}

function useCustomMutation<TData, TVariables>(
  mutationFn: (values: TVariables) => Promise<TData>,
  { key, onSuccessCallback, onErrorCallback, options }: MutationProps<TData, TVariables>,
) {
  const queryClient = useQueryClient()

  return useMutation<TData, NormalizedApiError, TVariables>({
    mutationFn: async (values) => {
      try {
        return await mutationFn(values)
      } catch (error) {
        throw normalizeApiError(error)
      }
    },
    onSuccess: async (data) => {
      if (key) {
        await queryClient.invalidateQueries({ queryKey: key })
      }

      onSuccessCallback?.(data)
    },
    onError: (error) => {
      onErrorCallback?.(error)
    },
    ...options,
  })
}

export function useMutationAction<
  TData = unknown,
  TVariables = unknown,
  TResponse extends ApiSuccessResponse<TData> = ApiSuccessResponse<TData>,
>(
  props: MutationProps<TData, TVariables>,
) {
  const axios = useAxios()
  const requestHeaders = {
    ...props.headers,
    ...(props.contentType ? { 'Content-Type': props.contentType } : {}),
  }

  return useCustomMutation<TData, TVariables>(
    async (values: TVariables): Promise<TData> => {
      const url = typeof props.url === 'function' ? props.url(values) : props.url
      const body = props.body ? props.body(values) : values
      const response = props.method === 'delete'
        ? await axios.delete<TResponse>(url, {
            data: body,
            headers: requestHeaders,
          })
        : await axios[props.method]<TResponse>(url, body, {
            headers: requestHeaders,
          })

      return response.data.data
    },
    props,
  )
}
