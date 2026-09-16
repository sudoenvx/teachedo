import { z } from 'zod';

export const studentLoginSchema = z.object({
    body: z.object({
        studentCode: z.string().min(1, 'Student code is required'),
        password: z.string().min(1, 'Password is required'),
    }),
});

export const fastCreateParentSchema = z.object({
    fullName: z.string().min(2, 'Parent full name is required'),
    phoneNumber: z.string().min(10, 'Parent phone number is required'),
    whatsappNumber: z.string().optional().nullable(),
    password: z.string().optional().nullable(),
});

export const createStudentSchema = z.object({
    body: z.object({
        fullName: z.string().min(2, 'Full name must be at least 2 characters'),
        phoneNumber: z.string().optional().nullable(),
        profilePictureUrl: z.string().url().optional().nullable(),
        studyStageId: z.number().int().positive().optional().nullable(),
        status: z.enum(['active', 'inactive']).default('active'),
        studentCode: z.string().optional().nullable(),
        password: z.string().optional().nullable(),
        
        // Parent linking: either existing parentId OR fast-create parent data
        parentId: z.number().int().positive().optional().nullable(),
        parent: z.preprocess((value) => {
            if (typeof value !== 'string') return value;
            try { return JSON.parse(value); } catch { return value; }
        }, fastCreateParentSchema.optional().nullable()),

        // Initial enrollment
        groupId: z.number().int().positive().optional().nullable(),
        customPrice: z.number().nonnegative().optional().nullable(),
    }),
});

export const updateStudentSchema = z.object({
    params: z.object({
        id: z.coerce.number().positive('Invalid student ID'),
    }),
    body: z.object({
        fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
        phoneNumber: z.string().optional().nullable(),
        profilePictureUrl: z.string().url().optional().nullable(),
        studyStageId: z.number().int().positive().optional().nullable(),
        parentId: z.number().int().positive().optional(),
        status: z.enum(['active', 'inactive']).optional(),
        studentCode: z.string().optional().nullable(),
        password: z.string().min(6, 'Password must be at least 6 characters').optional().nullable(),
    }),
});

export const enrollStudentSchema = z.object({
    params: z.object({
        id: z.coerce.number().positive('Invalid student ID'),
    }),
    body: z.object({
        groupId: z.number().int().positive('Group ID is required'),
        customPrice: z.number().nonnegative().optional().nullable(),
    }),
});

export const queryStudentsSchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).default(1),
        perPage: z.coerce.number().min(1).max(100).default(10),
        search: z.string().optional(),
        stageId: z.coerce.number().optional(),
        groupId: z.coerce.number().optional(),
        status: z.string().optional(),
    }),
});

export const studentIdParamSchema = z.object({
    params: z.object({
        id: z.coerce.number().positive('Invalid student ID'),
    }),
});

export const unenrollStudentParamSchema = z.object({
    params: z.object({
        id: z.coerce.number().positive('Invalid student ID'),
        groupId: z.coerce.number().positive('Invalid group ID'),
    }),
});

export type StudentLoginInput = z.infer<typeof studentLoginSchema>['body'];
export type CreateStudentInput = z.infer<typeof createStudentSchema>['body'];
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>['body'];
export type EnrollStudentInput = z.infer<typeof enrollStudentSchema>['body'];
export type QueryStudentsInput = z.infer<typeof queryStudentsSchema>['query'];
export type StudentIdParam = z.infer<typeof studentIdParamSchema>['params'];
