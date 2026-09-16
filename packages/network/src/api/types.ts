import type { AxiosRequestConfig } from "axios";
// import type { HttpMethod } from "./http-method";

export interface RequestConfig extends Omit<AxiosRequestConfig, "method" | "url" | "data"> {
  /** send as multipart/form-data — plain object body gets auto-converted to FormData */
  isMultipart?: boolean;
  /** skip auth header/refresh logic entirely for this request */
  skipAuth?: boolean;
}

export interface ApiResponse<T> {
  data: T;
  status: number;
  headers: Record<string, unknown>;
}

/**
 * Not every API uses "Bearer". Configure header name + scheme (or null for a raw token,
 * e.g. some APIs just want the token itself with no prefix).
 */
export interface AuthConfig {
  /** Header to attach the token on. Omit entirely if you're 100% cookie-based. */
  headerName?: string;
  /** e.g. "Bearer", "Token", "JWT". Pass null to send the raw token with no prefix. */
  scheme?: string | null;
  /** Return the current in-memory/localStorage token, if you keep one client-side. */
  getToken?: () => string | null | Promise<string | null>;
  /** Called on 401 to attempt a silent refresh (e.g. hits a /refresh endpoint that sets a new cookie). */
  refresh?: () => Promise<string | void>;
  onRefreshed?: (token?: string) => void;
  onAuthFailure?: () => void;
}

export interface ApiClientConfig {
  baseURL: string;
  defaultHeaders?: Record<string, string>;
  timeout?: number;
  /** send the secure httpOnly cookie with every request */
  withCredentials?: boolean;
  auth?: AuthConfig;
  maxRetries?: number;
  retryDelayMs?: number;
  retryOnStatusCodes?: number[];
}