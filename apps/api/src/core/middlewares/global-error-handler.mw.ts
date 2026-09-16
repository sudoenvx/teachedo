import { Request, Response, NextFunction } from 'express';
import { ApiError } from '../../shared/contracts/api-error';
import logger from '../utils/logger';
import { ApiResponse } from '../types/api-response';

export function globalErrorHandler(
    err: Error, 
    req: Request, 
    res: Response, 
    _next: NextFunction
): void {
    // 1. If it's our known custom error, return it cleanly
    if (err instanceof ApiError) {
        // Optional: Only log 5xx errors, ignore 400s (Bad Request) in server logs
        if (err.status >= 500) {
            logger.error(`[${req.method} ${req.url}] ${err.message}`, { stack: err.stack });
        }
        ApiResponse.error(res, err);
        return;
    }

    // 2. If it's an UNKNOWN error (e.g., Prisma crash, null pointer, syntax error)
    // Log the FULL stack trace so you can debug it
    logger.error(`[UNHANDLED] [${req.method} ${req.url}] ${err.message}`, { stack: err.stack });

    // 3. Hide the raw error from the user, send a generic 500 response
    ApiResponse.fromError(res, err);
}