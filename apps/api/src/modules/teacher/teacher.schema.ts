import { z } from 'zod';

export const teacherLoginSchema = z.object({
    body: z.object({
        username: z.string().trim().min(3, 'Username is required'),
        password: z.string().min(1, 'Password is required'),
    }),
});

export const createTeacherSchema = z.object({
    body: z.object({
        fullName: z.string().min(2, 'Full name must be at least 2 characters'),
        username: z.string().trim().min(3, 'Username is required'),
        email: z.string().email('Invalid email address').optional().nullable(),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        phoneNumber: z.string().optional().nullable(),
        subjectSpecialization: z.string().optional().nullable(),
        accountStatus: z.enum(['active', 'suspended_payment', 'inactive', 'trial']).default('active'),
        profilePictureUrl: z.string().url().optional().nullable(),
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

export const completeTeacherOnboardingSchema = z.object({
    body: z.object({
        fullName: z.string().trim().min(2, 'Full name must be at least 2 characters'),
        phoneNumber: z.string().trim().optional().nullable(),
        subjectSpecialization: z.string().trim().optional().nullable(),
        subjectId: z.number().int().positive(),
        stages: z.array(z.object({
            stageGroup: z.enum(['primary', 'preparatory', 'secondary']),
            gradeNumber: z.number().int().min(1).max(6),
        })).min(1, 'Select at least one stage'),
        policyKey: z.string().min(1),
        policyVersion: z.number().int().positive(),
    }),
});

export type TeacherLoginInput = z.infer<typeof teacherLoginSchema>['body'];
export type CreateTeacherInput = z.infer<typeof createTeacherSchema>['body'];
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>['body'];
export type UpdateTeacherStatusInput = z.infer<typeof updateTeacherStatusSchema>['body'];
export type QueryTeachersInput = z.infer<typeof queryTeachersSchema>['query'];
export type TeacherIdParamInput = z.infer<typeof teacherIdParamSchema>['params'];
export type CompleteTeacherOnboardingInput = z.infer<typeof completeTeacherOnboardingSchema>['body'];
