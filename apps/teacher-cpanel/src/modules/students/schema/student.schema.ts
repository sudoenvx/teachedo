import { z } from 'zod'

export const studentFormSchema = z.object({
  fullName: z.string().min(2, 'الاسم يجب أن يحتوي على حرفين على الأقل'),
  phoneNumber: z.string().optional(),
  status: z.enum(['active', 'inactive']),
  studentCode: z.string().optional(),
  password: z.string().optional(),
  parentFullName: z.string().optional(),
  parentPhone: z.string().optional(),
  parentWhatsapp: z.string().optional(),
  parentPassword: z.string().optional(),
  includeParent: z.boolean(),
  classIds: z.array(z.string()).optional(),
  studentAttendanceType: z.enum(['in_person', 'online_streaming', 'hybrid_both']),
}).superRefine((values, context) => {
  if (!values.includeParent) return

  if ((values.parentFullName || '').trim().length < 2) {
    context.addIssue({ code: 'custom', path: ['parentFullName'], message: 'اسم ولي الأمر مطلوب' })
  }
  if ((values.parentPhone || '').trim().length < 10) {
    context.addIssue({ code: 'custom', path: ['parentPhone'], message: 'رقم ولي الأمر غير صحيح' })
  }
})

export type StudentFormValues = z.infer<typeof studentFormSchema>
