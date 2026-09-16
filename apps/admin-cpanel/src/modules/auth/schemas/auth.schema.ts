import { z } from 'zod'

export const adminLoginSchema = z.object({
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('صيغة البريد الإلكتروني غير صحيحة'),
  password: z
    .string()
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})

export type AdminLoginFormValues = z.infer<typeof adminLoginSchema>

export const adminRegisterSchema = z.object({
  name: z
    .string()
    .min(1, 'الاسم مطلوب')
    .min(3, 'الاسم يجب أن يكون 3 أحرف على الأقل'),
  email: z
    .string()
    .min(1, 'البريد الإلكتروني مطلوب')
    .email('صيغة البريد الإلكتروني غير صحيحة'),
  password: z
    .string()
    .min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'),
})