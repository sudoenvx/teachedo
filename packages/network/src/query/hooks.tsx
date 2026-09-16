import {
  useQuery,
  useMutation,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from "@tanstack/react-query";
import { apiClient, HttpMethod, type RequestConfig } from "../api";

/* ---------------- GET ---------------- */

interface UseGetQueryOptions<TResponse>
  extends Omit<UseQueryOptions<TResponse>, "queryKey" | "queryFn"> {
  /** query-string params, also used to build the default query key */
  params?: Record<string, unknown>;
  /** override the auto-derived query key */
  queryKey?: QueryKey;
  requestConfig?: RequestConfig;
}

export function useGetQuery<TResponse = unknown>(
  path: string,
  options?: UseGetQueryOptions<TResponse>
) {
  const { params, queryKey, requestConfig, ...rest } = options ?? {};

  return useQuery<TResponse>({
    queryKey: queryKey ?? [path, params ?? {}],
    queryFn: async () => {
      const res = await apiClient.get<TResponse>(path, { ...requestConfig, params });
      return res.data;
    },
    ...rest,
  });
}

/* ---------------- MUTATION (POST/PUT/PATCH/DELETE) ---------------- */

interface UseMutationActionOptions<TResponse, TVariables>
  extends Omit<UseMutationOptions<TResponse, unknown, TVariables>, "mutationFn"> {
  method?: HttpMethod;
  isMultipart?: boolean;
  requestConfig?: RequestConfig;
}

export function useMutationAction<TResponse = unknown, TVariables = unknown>(
  /** static path, or a function so you can build it from the mutation variables (e.g. `/users/${id}`) */
  path: string | ((variables: TVariables) => string),
  options?: UseMutationActionOptions<TResponse, TVariables>
) {
  const { method = "POST", isMultipart, requestConfig, ...rest } = options ?? {};

  return useMutation<TResponse, unknown, TVariables>({
    mutationFn: async (variables: TVariables) => {
      const resolvedPath = typeof path === "function" ? path(variables) : path;

      const res = await apiClient.request<TResponse>(
        method,
        resolvedPath,
        variables,
        { ...requestConfig, isMultipart }
      );
      return res.data;
    },
    ...rest,
  });
}