import { z } from 'zod';

export const teacherLoginSchema = z.object({
    body: z.object({
        username: z.string().trim().min(3, 'Username is required'),
        password: z.string().min(1, 'Password is required'),
    }),
});

export const changeTeacherPasswordSchema = z.object({
    body: z.object({
        currentPassword: z.string().min(1, 'Current password is required'),
        newPassword: z.string().min(6, 'New password must be at least 6 characters'),
        confirmPassword: z.string().min(6, 'Confirm the new password'),
    }).refine((value) => value.newPassword === value.confirmPassword, {
        path: ['confirmPassword'],
        message: 'Passwords do not match',
    }),
});

export const createTeacherSchema = z.object({
    body: z.object({
        fullName: z.string().min(2, 'Full name must be at least 2 characters'),
        username: z.string().trim().min(3, 'Username is required'),
        email: z.string().email('Invalid email address').optional().nullable(),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        phoneNumber: z.string().trim().min(7, 'Primary phone number must be at least 7 characters').optional().nullable(),
        subjectSpecialization: z.string().optional().nullable(),
        accountStatus: z.enum(['active', 'suspended_payment', 'inactive', 'trial']).default('active'),
        profilePictureUrl: z.string().url().optional().nullable(),
        pricePerStudent: z.coerce.number().finite().min(0).optional().nullable(),
        customSubdomain: z.string().trim().toLowerCase().regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, 'Invalid subdomain').optional().nullable(),
    }),
});

export const updateTeacherSchema = z.object({
    params: z.object({
        id: z.coerce.number().positive('Invalid teacher ID'),
    }),
    body: z.object({
        fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
        username: z.string().trim().min(3, 'Username is required').optional(),
        email: z.string().email('Invalid email address').optional().nullable(),
        password: z.string().min(6, 'Password must be at least 6 characters').optional(),
        phoneNumber: z.string().optional().nullable(),
        subjectSpecialization: z.string().optional().nullable(),
        accountStatus: z.enum(['active', 'suspended_payment', 'inactive', 'trial']).optional(),
        profilePictureUrl: z.string().url().optional().nullable(),
        pricePerStudent: z.coerce.number().finite().min(0).optional().nullable(),
        customSubdomain: z.string().trim().toLowerCase().regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, 'Invalid subdomain').optional().nullable(),
    }),
});

export const updateTeacherStatusSchema = z.object({
    params: z.object({
        id: z.coerce.number().positive('Invalid teacher ID'),
    }),
    body: z.object({
        accountStatus: z.enum(['active', 'suspended_payment', 'inactive', 'trial']),
    }),
});

export const queryTeachersSchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).default(1),
        perPage: z.coerce.number().min(1).max(100).default(10),
        search: z.string().optional(),
        status: z.string().optional(),
        subjectSpecialization: z.string().optional(),
    }),
});

export const teacherIdParamSchema = z.object({
    params: z.object({
        id: z.coerce.number().positive('Invalid teacher ID'),
    }),
});

export const teacherSubdomainAvailabilitySchema = z.object({
    query: z.object({
        subdomain: z.string().trim().toLowerCase().regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, 'Invalid subdomain'),
    }),
});

const jsonArray = <T extends z.ZodTypeAny>(schema: T) => z.preprocess((value) => {
    if (typeof value !== 'string') return value;
    try { return JSON.parse(value); } catch { return value; }
}, schema);

export const completeTeacherOnboardingSchema = z.object({
    body: z.object({
        fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
        username: z.string().trim().min(3, 'Username must be at least 3 characters'),
        email: z.string().trim().email('Invalid email address').optional().nullable(),
        phoneNumber: z.string().trim().optional().nullable(),
        subjectSpecialization: z.string().trim().optional().nullable(),
        subjectIds: jsonArray(z.array(z.coerce.number().int().positive()).default([])),
        subjectId: z.coerce.number().int().positive(),
        customSubjects: jsonArray(z.array(z.string().trim().min(2).max(100)).default([])),
        stages: jsonArray(z.array(z.object({
            stageGroup: z.enum(['primary', 'preparatory', 'secondary']),
            gradeNumber: z.coerce.number().int().min(1).max(6),
        })).min(1, 'Select at least one stage')),
        famousName: z.string().trim().max(120).optional().nullable(),
        teachingMode: z.enum(['center', 'institute', 'both']),
        customSubdomain: z.string().trim().toLowerCase().regex(/^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/, 'Invalid subdomain').optional().nullable(),
        policyKey: z.string().min(1),
        policyVersion: z.coerce.number().int().positive(),
    }).refine((value) => value.subjectIds.length > 0 || value.customSubjects.length > 0, {
        path: ['subjectIds'],
        message: 'Select at least one subject or add a custom subject',
    }),
});

export type TeacherLoginInput = z.infer<typeof teacherLoginSchema>['body'];
export type ChangeTeacherPasswordInput = z.infer<typeof changeTeacherPasswordSchema>['body'];
export type CreateTeacherInput = z.infer<typeof createTeacherSchema>['body'];
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>['body'];
export type UpdateTeacherStatusInput = z.infer<typeof updateTeacherStatusSchema>['body'];
export type QueryTeachersInput = z.infer<typeof queryTeachersSchema>['query'];
export type TeacherIdParamInput = z.infer<typeof teacherIdParamSchema>['params'];
export type TeacherSubdomainAvailabilityInput = z.infer<typeof teacherSubdomainAvailabilitySchema>['query'];
export type CompleteTeacherOnboardingInput = z.infer<typeof completeTeacherOnboardingSchema>['body'];
