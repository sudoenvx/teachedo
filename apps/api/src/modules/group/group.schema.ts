import { z } from 'zod';

const groupFields = {
    groupName: z.string().trim().min(2, 'Group name must be at least 2 characters'),
    studyStageId: z.number().int().positive().optional().nullable(),
    standardMonthlyFee: z.number().nonnegative().optional().nullable(),
    maxCapacity: z.number().int().positive().optional().nullable(),
};
const schedule = z.object({
    dayOfWeek: z.enum(['saturday', 'sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday']),
    startTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
    endTime: z.string().regex(/^([01]\d|2[0-3]):[0-5]\d$/),
}).refine((value) => value.startTime < value.endTime, 'End time must be after start time');

export const createGroupSchema = z.object({
    body: z.object({ ...groupFields, schedules: z.array(schedule).optional() }),
});

export const updateGroupSchema = z.object({
    params: z.object({ id: z.coerce.number().positive('Invalid group ID') }),
    body: z.object({
        groupName: groupFields.groupName.optional(),
        studyStageId: groupFields.studyStageId,
        standardMonthlyFee: groupFields.standardMonthlyFee,
        maxCapacity: groupFields.maxCapacity,
        schedules: z.array(schedule).optional(),
    }),
});

export const groupIdParamSchema = z.object({
    params: z.object({ id: z.coerce.number().positive('Invalid group ID') }),
});

export type CreateGroupInput = z.infer<typeof createGroupSchema>['body'];
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>['body'];