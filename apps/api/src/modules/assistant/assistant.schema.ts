import { z } from 'zod';

export const assistantLoginSchema = z.object({
    body: z.object({
        username: z.string().min(3, 'Username must be at least 3 characters'),
        password: z.string().min(1, 'Password is required'),
    }),
});

export const createAssistantSchema = z.object({
    body: z.object({
        fullName: z.string().min(2, 'Full name must be at least 2 characters'),
        username: z.string().min(3, 'Username must be at least 3 characters').optional(),
        email: z.string().email('Invalid email address').optional().nullable(),
        password: z.string().min(6, 'Password must be at least 6 characters'),
        phoneNumber: z.string().optional().nullable(),
        permissionKeys: z.array(z.string()).default([]),
    }),
});

export const updateAssistantSchema = z.object({
    params: z.object({
        id: z.coerce.number().positive('Invalid assistant ID'),
    }),
    body: z.object({
        fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
        username: z.string().min(3, 'Username must be at least 3 characters').optional(),
        email: z.string().email('Invalid email address').optional().nullable(),
        password: z.string().min(6, 'Password must be at least 6 characters').optional(),
        phoneNumber: z.string().optional().nullable(),
        permissionKeys: z.array(z.string()).optional(),
    }),
});

export const queryAssistantsSchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).default(1),
        perPage: z.coerce.number().min(1).max(100).default(10),
        search: z.string().optional(),
    }),
});

export const assistantIdParamSchema = z.object({
    params: z.object({
        id: z.coerce.number().positive('Invalid assistant ID'),
    }),
});

export type AssistantLoginInput = z.infer<typeof assistantLoginSchema>['body'];
export type CreateAssistantInput = z.infer<typeof createAssistantSchema>['body'];
export type UpdateAssistantInput = z.infer<typeof updateAssistantSchema>['body'];
export type QueryAssistantsInput = z.infer<typeof queryAssistantsSchema>['query'];
export type AssistantIdParam = z.infer<typeof assistantIdParamSchema>['params'];
