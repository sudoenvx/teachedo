import { ErrorMessage } from "./error-code-messages";
import { ApiStatusCode } from "./status-codes";

type ErrorCodeType = (typeof ErrorMessage)[keyof typeof ErrorMessage];
type StatusCodeType = (typeof ApiStatusCode)[keyof typeof ApiStatusCode];

class ApiError extends Error {
    code: ErrorCodeType
    status: StatusCodeType
    details: Array<string>
    constructor(
        message: string,
        code: ErrorCodeType = ErrorMessage.INTERNAL_SERVER_ERROR,
        status: StatusCodeType = ApiStatusCode.INTERNAL_SERVER_ERROR,
        details: Array<string> = []
    ) {
        super(message);
        this.code = code;
        this.status = status;
        this.details = details;
    }
}

class ValidationError extends ApiError {
    constructor(details = []) {
        super("Validation failed", ErrorMessage.VALIDATION_ERROR, ApiStatusCode.BAD_REQUEST, details);
    }
}

class UnauthorizedError extends ApiError {
    constructor(message = "Unauthorized") {
        super(message, ErrorMessage.UNAUTHORIZED, ApiStatusCode.UNAUTHORIZED);
    }
}

class DuplicationError extends ApiError {
    constructor(message = "Data is duplicated") {
        super(message, ErrorMessage.RESOURCE_EXISTS, ApiStatusCode.CONFLICT);
    }
}

class BadRequestError extends ApiError {
    constructor(message = "Bad Request") {
        super(message, ErrorMessage.BAD_REQUEST, ApiStatusCode.BAD_REQUEST);
    }
}


class NotFoundError extends ApiError {
    constructor(message = "Not Found") {
        super(message, ErrorMessage.NOT_FOUND, ApiStatusCode.NOT_FOUND);
    }
}


export {
    UnauthorizedError as AuthError,
    ValidationError,
    DuplicationError,
    ApiError,
    BadRequestError,
    NotFoundError
}
