// error-codes.ts
export const ErrorMessage = {
  INTERNAL_SERVER_ERROR: "INTERNAL_SERVER_ERROR",
  VALIDATION_ERROR: "VALIDATION_ERROR",
  BAD_REQUEST: "BAD_REQUEST",
  UNAUTHENTICATED: "UNAUTHENTICATED", // 401
  UNAUTHORIZED: "UNAUTHORIZED",       // 403
  NOT_FOUND: "NOT_FOUND",
  RESOURCE_EXISTS: "RESOURCE_EXISTS", // Better than DUPLICATION
} as const;

export type ErrorCodeType = (typeof ErrorMessage)[keyof typeof ErrorMessage];