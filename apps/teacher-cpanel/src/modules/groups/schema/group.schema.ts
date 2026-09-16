import { z } from 'zod'

export const groupFormSchema = z.object({
  groupName: z.string().trim().min(2, 'اسم المجموعة مطلوب'),
  studyStageId: z.string().optional(),
  standardMonthlyFee: z.string().optional(),
  maxCapacity: z.string().optional(),
  schedules: z.array(z.object({ dayOfWeek: z.string(), startTime: z.string(), endTime: z.string() }).refine((schedule) => schedule.startTime < schedule.endTime, { message: 'يجب أن يكون وقت النهاية بعد البداية', path: ['endTime'] })).min(1, 'أضف موعداً واحداً على الأقل'),
})

export type GroupFormValues = z.infer<typeof groupFormSchema>