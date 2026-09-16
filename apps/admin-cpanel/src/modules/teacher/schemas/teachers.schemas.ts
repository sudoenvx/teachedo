import { z } from 'zod'

export const createTeacherSchema = z.object({
  fullName: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  username: z.string().min(3, 'اسم المستخدم يجب أن يكون 3 أحرف على الأقل'),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  accountStatus: z.enum(['active', 'suspended_payment', 'inactive', 'trial']).default('active'),
})

export type CreateTeacherFormValues = z.input<typeof createTeacherSchema>