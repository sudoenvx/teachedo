import { z } from 'zod';

export const subjectIdSchema = z.object({ params: z.object({ id: z.coerce.number().positive() }) });

export const createSubjectSchema = z.object({
    body: z.object({
        name: z.string().trim().min(2).max(100),
        icon: z.string().trim().min(1).max(50),
        isActive: z.boolean().optional(),
        ordering: z.number().int().optional(),
    }),
});

export const updateSubjectSchema = z.object({
    params: z.object({ id: z.coerce.number().positive() }),
    body: createSubjectSchema.shape.body.partial(),
});

export type CreateSubjectInput = z.infer<typeof createSubjectSchema>['body'];
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>['body'];