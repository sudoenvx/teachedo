import { z } from 'zod';

export const parentLoginSchema = z.object({
    body: z.object({
        phoneNumber: z.string().min(1, 'Phone number is required'),
        password: z.string().min(1, 'Password is required'),
    }),
});

export const createParentSchema = z.object({
    body: z.object({
        fullName: z.string().min(2, 'Full name must be at least 2 characters'),
        phoneNumber: z.string().min(10, 'Valid phone number is required'),
        whatsappNumber: z.string().optional().nullable(),
        password: z.string().min(6, 'Password must be at least 6 characters').default('123456'),
    }),
});

export const updateParentSchema = z.object({
    params: z.object({
        id: z.coerce.number().positive('Invalid parent ID'),
    }),
    body: z.object({
        fullName: z.string().min(2, 'Full name must be at least 2 characters').optional(),
        phoneNumber: z.string().min(10).optional(),
        whatsappNumber: z.string().optional().nullable(),
        password: z.string().min(6).optional(),
    }),
});

export const queryParentsSchema = z.object({
    query: z.object({
        page: z.coerce.number().min(1).default(1),
        perPage: z.coerce.number().min(1).max(100).default(10),
        search: z.string().optional(),
    }),
});

export const parentIdParamSchema = z.object({
    params: z.object({
        id: z.coerce.number().positive('Invalid parent ID'),
    }),
});

export type ParentLoginInput = z.infer<typeof parentLoginSchema>['body'];
export type CreateParentInput = z.infer<typeof createParentSchema>['body'];
export type UpdateParentInput = z.infer<typeof updateParentSchema>['body'];
export type QueryParentsInput = z.infer<typeof queryParentsSchema>['query'];
export type ParentIdParam = z.infer<typeof parentIdParamSchema>['params'];
