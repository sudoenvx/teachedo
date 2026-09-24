import { z } from 'zod'

export const groupFormSchema = z.object({
  className: z.string().trim().min(2, 'اسم المجموعة مطلوب'),
  gradeLevel: z.string().trim().min(1, 'المرحلة الدراسية مطلوبة'),
  centerId: z.string().optional(),
  sessionPrice: z.string().refine((value) => !value || Number(value) >= 0, 'أدخل سعراً صحيحاً'),
  monthlyPrice: z.string().refine((value) => !value || Number(value) >= 0, 'أدخل سعراً صحيحاً'),
  maxCapacity: z.string().refine((value) => !value || Number.isInteger(Number(value)) && Number(value) > 0, 'أدخل عدداً صحيحاً أكبر من صفر'),
  groupTier: z.enum(['normal', 'vip']),
  deliveryMode: z.enum(['offline', 'online', 'hybrid']),
})

export type GroupFormValues = z.infer<typeof groupFormSchema>
