import { z } from 'zod';

const classFields = {
    className: z.string().trim().min(2, 'Class name must be at least 2 characters'),
    gradeLevel: z.string().trim().min(1, 'Grade level is required'),
    centerId: z.number().int().positive().optional().nullable(),
    sessionPrice: z.number().nonnegative().optional().nullable(),
    monthlyPrice: z.number().nonnegative().optional().nullable(),
    maxCapacity: z.number().int().positive().optional().nullable(),
};

const groupTier = z.enum(['normal', 'vip']);
const deliveryMode = z.enum(['offline', 'online', 'hybrid']);
const sessionType = z.enum([
    'regular',
    'extra_revision',
    'final_revision',
    'quiz_only',
    'mock_exam',
    'assessment',
    'other',
]);

export const createClassSchema = z.object({
    body: z.object({
        ...classFields,
        groupTier: groupTier.default('normal'),
        deliveryMode: deliveryMode.default('offline'),
    }),
});

export const updateClassSchema = z.object({
    params: z.object({ id: z.coerce.number().positive('Invalid class ID') }),
    body: z.object({
        className: classFields.className.optional(),
        gradeLevel: classFields.gradeLevel,
        centerId: classFields.centerId,
        sessionPrice: classFields.sessionPrice,
        monthlyPrice: classFields.monthlyPrice,
        maxCapacity: classFields.maxCapacity,
        groupTier: groupTier.optional(),
        deliveryMode: deliveryMode.optional(),
    }),
});

export const classIdParamSchema = z.object({
    params: z.object({ id: z.coerce.number().positive('Invalid class ID') }),
});

export const createClassSessionSchema = z.object({
    params: z.object({ id: z.coerce.number().positive('Invalid class ID') }),
    body: z.object({
        sessionDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Session date must use YYYY-MM-DD format'),
        sessionType: sessionType.default('regular'),
        scheduledStartTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/, 'Start time must use HH:mm format').optional().nullable(),
        durationMinutes: z.number().int().positive().max(600).default(60),
        isMandatory: z.boolean().default(true),
        topic: z.string().trim().max(255).optional().nullable(),
    }),
});

export type CreateClassInput = z.infer<typeof createClassSchema>['body'];
export type UpdateClassInput = z.infer<typeof updateClassSchema>['body'];
export type CreateClassSessionInput = z.infer<typeof createClassSessionSchema>['body'];
