import { Response } from 'express';
import { ApiStatusCode } from '../../shared/contracts/status-codes';
import { ApiError } from '../../shared/contracts/api-error';
import { ErrorMessage } from '../../shared/contracts/error-code-messages';

interface SuccessBody<T> {
    success: true;
    message: string;
    data: T | null;
    meta: Record<string, unknown> | null;
}

interface ErrorBody {
    success: false;
    message: string;
    code: string;
    details: Array<string>;
    meta: Record<string, unknown> | null;
}

export interface PaginationMeta {
    current_page: number;
    per_page: number;
    total: number;
    last_page: number;
    from: number | null;
    to: number | null;
    path: string;
    first_page_url: string;
    last_page_url: string;
    next_page_url: string | null;
    prev_page_url: string | null;
}

/** Minimal shape this helper needs from whatever paginator you use. */
export interface Paginatable {
    currentPage: number;
    perPage: number;
    total: number;
    lastPage: number;
    from: number | null;
    to: number | null;
    path: string;
}

export class ApiResponse {
    static success<T = unknown>(
        res: Response,
        data: T | null = null,
        message = 'Request completed successfully.',
        meta: Record<string, unknown> | null = null,
        status: number = ApiStatusCode.OK,
    ): Response {
        const body: SuccessBody<T> = { success: true, message, data, meta };
        return res.status(status).json(body);
    }

    /**
     * Send a response from an ApiError (or any of its subclasses:
     * ValidationError, AuthError, DuplicationError, BadRequestError, NotFoundError).
     */
    static error(res: Response, error: ApiError, meta: Record<string, unknown> | null = null): Response {
        const body: ErrorBody = {
            success: false,
            message: error.message,
            code: error.code,
            details: error.details,
            meta,
        };
        return res.status(error.status).json(body);
    }

    /**
     * Normalize any thrown value into an ApiResponse. Use this in your
     * Express error-handling middleware so unexpected (non-ApiError) throws
     * still come back as a well-formed response instead of leaking a stack trace.
     */
    static fromError(res: Response, err: unknown): Response {
        if (err instanceof ApiError) {
            return ApiResponse.error(res, err);
        }

        // SECURITY FIX: Only expose raw error messages in development!
        const isDev = process.env.NODE_ENV !== 'production';
        const message = isDev && err instanceof Error ? err.message : 'Something went wrong.';

        const fallback = new ApiError(
            message,
            ErrorMessage.INTERNAL_SERVER_ERROR,
            ApiStatusCode.INTERNAL_SERVER_ERROR,
        );
        return ApiResponse.error(res, fallback);
    }

    static paginationMeta(paginator: Paginatable, requestUrl: string): PaginationMeta {
        const url = new URL(requestUrl, 'http://localhost');
        const buildUrl = (page: number | null): string | null => {
            if (page === null) return null;
            url.searchParams.set('page', String(page));
            return url.pathname + url.search;
        };

        return {
            current_page: paginator.currentPage,
            per_page: paginator.perPage,
            total: paginator.total,
            last_page: paginator.lastPage,
            from: paginator.from,
            to: paginator.to,
            path: paginator.path,
            first_page_url: buildUrl(1)!,
            last_page_url: buildUrl(paginator.lastPage)!,
            next_page_url: paginator.currentPage < paginator.lastPage ? buildUrl(paginator.currentPage + 1) : null,
            prev_page_url: paginator.currentPage > 1 ? buildUrl(paginator.currentPage - 1) : null,
        };
    }
}