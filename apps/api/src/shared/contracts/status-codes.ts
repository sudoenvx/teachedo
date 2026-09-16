// status-codes.ts
export const ApiStatusCode = {
    OK: 200,
    CREATED: 201,
    NOT_MODIFIED: 304,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401, // Use this for "Not logged in" or "Wrong password"
    FORBIDDEN: 403,    // Use this for "Logged in, but not allowed to do this action"
    NOT_FOUND: 404,
    CONFLICT: 409,     // Better name than ALREADY_EXISTS
    UNPROCESSABLE_ENTITY: 422, // Often used for Validation errors
    INTERNAL_SERVER_ERROR: 500,
} as const;

export type StatusCodeType = (typeof ApiStatusCode)[keyof typeof ApiStatusCode];