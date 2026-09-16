export type UserRole = 'admin' | 'super_admin' | 'teacher' | 'assistant' | 'parent' | 'student';

export interface AuthTokenPayload {
    id: number;
    role: UserRole;
    email?: string;
    phoneNumber?: string;
    scopeTeacherId?: number;
    permissions?: string[];
}

declare global {
    namespace Express {
        interface Request {
            user?: AuthTokenPayload;
            scope?: number;
        }
    }
}
