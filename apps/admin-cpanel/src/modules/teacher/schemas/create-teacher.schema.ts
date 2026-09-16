import { z } from 'zod'

export const createTeacherSchema = z.object({
  name: z.string().min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  phone: z.string().min(10, 'رقم الهاتف غير صالح'),
  email: z.string().email('البريد الإلكتروني غير صالح').optional().or(z.literal('')),
  subject: z.string().min(2, 'يرجى إدخال المادة'),
  pricePerStudent: z.coerce.number().optional().default(0),
  password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
  confirmPassword: z.string(),
  // سنترك الصورة كـ optional string (أو File إذا كنت سترفعها كـ Multipart)
  avatar: z.any().optional(), 
}).refine((data) => data.password === data.confirmPassword, {
  message: 'كلمات المرور غير متطابقة',
  path: ['confirmPassword'],
})

export type CreateTeacherFormValues = z.infer<typeof createTeacherSchema>