import { z } from 'zod'

export const settingsSchema = z.object({
  price_per_student: z.number().min(0, 'السعر يجب أن يكون صفراً أو أكثر'),
  currency: z.string().min(1, 'العملة مطلوبة'),
  trial_days: z.number().int().min(0, 'فترة التجربة يجب أن تكون صفراً أو أكثر'),
  billing_cycle_days: z.number().int().positive('دورة الفوترة يجب أن تكون أكبر من صفر'),
  grace_period_days: z.number().int().min(0, 'فترة السماح يجب أن تكون صفراً أو أكثر'),
  auto_suspend_unpaid: z.boolean(),
  business_name: z.string().min(1, 'اسم المنصة مطلوب'),
  support_email: z.string().email('البريد الإلكتروني غير صالح'),
  support_phone: z.string().min(1, 'رقم التواصل مطلوب'),
  default_language: z.string().min(1, 'لغة النظام مطلوبة'),
  notify_on_payment_overdue: z.boolean(),
  weekly_system_report: z.boolean(),
})

export type SettingsFormValues = z.infer<typeof settingsSchema>
