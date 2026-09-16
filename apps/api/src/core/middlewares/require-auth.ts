import { Request, Response, NextFunction } from "express";
import { AuthError } from "../../shared/contracts/api-error";
import { verifyToken } from "../utils/auth/jwt";
import { AUTH_COOKIE_NAME } from "../utils/auth/cookie";
import { AuthTokenPayload, UserRole } from "../types/auth.types";

export const requireAuth = (req: Request, _res: Response, next: NextFunction) => {
    let token: string | undefined;

    console.log(req.headers.authorization);
    

    // 1. Mobile & REST API: check Authorization header (Bearer <token> or direct token)
    const authHeader = req.headers.authorization || (req.headers['x-access-token'] as string | undefined);
    if (authHeader) {
        token = authHeader.startsWith('Bearer ') || authHeader.startsWith('bearer ')
            ? authHeader.slice(7).trim()
            : authHeader.trim();
    }

    // 2. Web CPanel: fallback to HTTP-only cookie
    if (!token && req.cookies) {
        token = req.cookies[AUTH_COOKIE_NAME];
    }

    console.log(req.cookies[AUTH_COOKIE_NAME]);
    console.log(req.cookies);
    
    

    if (!token) {
        throw new AuthError('You have to be authenticated.');
    }

    const payload = verifyToken<AuthTokenPayload>(token);
    if (!payload || !payload.id) {
        throw new AuthError('Invalid or expired access token.');
    }

    req.user = payload;
    if (payload.scopeTeacherId) {
        req.scope = payload.scopeTeacherId;
    }

    next();
};

export const requireRole = (...roles: UserRole[]) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new AuthError('Authentication required.');
        }

        const userRole = req.user.role;
        const isAllowed = roles.includes(userRole) || (roles.includes('admin') && userRole === 'super_admin');

        if (!isAllowed) {
            throw new AuthError('You do not have permission to perform this action.');
        }

        next();
    };
};

export const requirePermission = (permissionKey: string) => {
    return (req: Request, _res: Response, next: NextFunction) => {
        if (!req.user) {
            throw new AuthError('Authentication required.');
        }

        if (req.user.role === 'teacher' || req.user.role === 'admin' || req.user.role === 'super_admin') {
            next();
            return;
        }

        const permissions = req.user.permissions || [];
        const hasPermission = permissions.includes('*') || permissions.includes(permissionKey);

        if (!hasPermission) {
            throw new AuthError(`Missing required permission: ${permissionKey}`);
        }

        next();
    };
};

export const requireScope = (req: Request, _res: Response, next: NextFunction) => {
    if (!req.scope) {
        throw new AuthError('Tenant scope could not be determined.');
    }
    next();
};