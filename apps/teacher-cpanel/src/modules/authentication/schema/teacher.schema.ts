import { z } from 'zod'

export const teacherLoginSchema = z.object({
  username: z.string().min(3, 'اسم المستخدم غير صالح'),
  password: z.string().min(6, 'كلمة المرور غير صالحة'),
})
export type TeacherLoginFormValues = z.infer<typeof teacherLoginSchema>