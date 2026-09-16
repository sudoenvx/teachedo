/** Builds a clean query string, dropping undefined/null/empty values — for filter/sort/pagination state in the URL. */
export function buildQueryString(params: Record<string, unknown>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) value.forEach((v) => search.append(key, String(v)));
    else search.set(key, String(value));
  });
  const str = search.toString();
  return str ? `?${str}` : "";
}

export interface PaginationParams {
  page?: number;
  pageSize?: number;
}

export function withPagination(params: Record<string, unknown>, { page = 1, pageSize = 20 }: PaginationParams) {
  return { ...params, page, pageSize };
}