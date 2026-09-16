import axios, { AxiosInstance, AxiosError, AxiosRequestConfig, AxiosHeaders } from "axios";
import { HttpMethod } from "./http-method";
import { ApiError, NetworkError } from "./errors";
import { toFormData, isFormData, FormDataValue } from "./form-data";
import type { ApiClientConfig, ApiResponse, AuthConfig, RequestConfig } from "./types";

const DEFAULT_RETRY_STATUS_CODES = [408, 429, 500, 502, 503, 504];

export class ApiClient {
  private instance: AxiosInstance;
  private auth?: AuthConfig;
  private maxRetries: number;
  private retryDelayMs: number;
  private retryOnStatusCodes: number[];
  private refreshPromise: Promise<string | void | null> | null = null;

  constructor(config: ApiClientConfig) {
    this.auth = config.auth;
    this.maxRetries = config.maxRetries ?? 2;
    this.retryDelayMs = config.retryDelayMs ?? 400;
    this.retryOnStatusCodes = config.retryOnStatusCodes ?? DEFAULT_RETRY_STATUS_CODES;

    this.instance = axios.create({
      baseURL: config.baseURL,
      timeout: config.timeout ?? 15_000,
      withCredentials: config.withCredentials ?? true, // secure cookie flow by default
      headers: config.defaultHeaders ?? { "Content-Type": "application/json" },
    });

    this.instance.interceptors.request.use(async (req) => {
      if ((req as RequestConfig).skipAuth || !this.auth?.getToken) return req;

      const token = await this.auth.getToken();
      if (token) {
        const headerName = this.auth.headerName ?? "Authorization";
        const scheme = this.auth.scheme ?? "Bearer";
        req.headers.set(headerName, scheme ? `${scheme} ${token}` : token);
      }
      return req;
    });
  }

  setAuthConfig(auth: AuthConfig) {
    this.auth = auth;
  }

  get<T>(path: string, config?: RequestConfig) {
    return this.request<T>(HttpMethod.GET, path, undefined, config);
  }
  post<T>(path: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>(HttpMethod.POST, path, body, config);
  }
  put<T>(path: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>(HttpMethod.PUT, path, body, config);
  }
  patch<T>(path: string, body?: unknown, config?: RequestConfig) {
    return this.request<T>(HttpMethod.PATCH, path, body, config);
  }
  delete<T>(path: string, config?: RequestConfig) {
    return this.request<T>(HttpMethod.DELETE, path, undefined, config);
  }

  async request<T>(
    method: HttpMethod,
    path: string,
    body?: unknown,
    config: RequestConfig = {},
    _retryCount = 0
  ): Promise<ApiResponse<T>> {
    const { isMultipart, headers, ...rest } = config;

    let data = body;toFormData
    const finalHeaders: Record<string, unknown> = { ...headers };

    if (isMultipart && body && !isFormData(body)) {
      data = toFormData(body as Record<string, FormDataValue>);
      // let axios/browser set the multipart boundary itself
      delete finalHeaders["Content-Type"];
    } else if (isFormData(body)) {
      delete finalHeaders["Content-Type"];
    }

    const axiosConfig: AxiosRequestConfig = {
      ...rest,
      method,
      url: path,
      data,
      headers: finalHeaders as AxiosHeaders,
    };

    try {
      const response = await this.instance.request<T>(axiosConfig);
      return { data: response.data, status: response.status, headers: response.headers as Record<string, unknown> };
    } catch (err) {
      const axiosErr = err as AxiosError;

      if (!axiosErr.response) {
        throw new NetworkError(axiosErr.message);
      }

      const status = axiosErr.response.status;

      // 401 -> try one silent refresh, then replay the request once
      if (status === 401 && !config.skipAuth && this.auth?.refresh) {
        const token = await this.handleRefresh();
        if (token !== null) {
          return this.request<T>(method, path, body, config, _retryCount);
        }
        this.auth.onAuthFailure?.();
      }

      const shouldRetry = this.retryOnStatusCodes.includes(status) && _retryCount < this.maxRetries;
      if (shouldRetry) {
        await new Promise((r) => setTimeout(r, this.retryDelayMs * 2 ** _retryCount));
        return this.request<T>(method, path, body, config, _retryCount + 1);
      }

      const errBody = axiosErr.response.data as { message?: string; code?: string } | undefined;
      throw new ApiError(errBody?.message ?? axiosErr.message, status, errBody?.code, errBody);
    }
  }

  private async handleRefresh() {
    if (!this.auth?.refresh) return null;
    if (!this.refreshPromise) {
      this.refreshPromise = this.auth
        .refresh()
        .then((token) => {
          this.auth?.onRefreshed?.(token ?? undefined);
          return token ?? undefined;
        })
        .catch(() => null)
        .finally(() => {
          this.refreshPromise = null;
        });
    }
    return this.refreshPromise;
  }
}