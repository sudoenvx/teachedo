import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useLocation, useNavigate } from 'react-router-dom'
import { CheckCircle2, KeyRound, ShieldCheck } from 'lucide-react'
import { z } from 'zod'

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Field, FieldContent, FieldLabel, PasswordInput } from '@teachedo/ui/components'
import { useNotification } from '@/core/hooks/use_notification'
import { useChangeTeacherPassword } from '../api/auth.mutations'

const schema = z.object({
  newPassword: z.string().min(6, 'كلمة المرور يجب أن تتكون من 6 أحرف على الأقل'),
  confirmPassword: z.string().min(6, 'أكد كلمة المرور الجديدة'),
}).refine((value) => value.newPassword === value.confirmPassword, { path: ['confirmPassword'], message: 'كلمتا المرور غير متطابقتين' })

type Values = z.infer<typeof schema>

export default function ChangePasswordPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { notify } = useNotification()
  const changePassword = useChangeTeacherPassword()
  const temporaryPassword = (location.state as { temporaryPassword?: string } | null)?.temporaryPassword
  const { register, handleSubmit, formState: { errors } } = useForm<Values>({ resolver: zodResolver(schema) })

  useEffect(() => {
    if (!temporaryPassword) navigate('/login', { replace: true })
  }, [navigate, temporaryPassword])

  const submit = async (values: Values) => {
    if (!temporaryPassword) return
    await changePassword.mutateAsync({ currentPassword: temporaryPassword, ...values }, {
      onSuccess: () => navigate('/welcome', { replace: true }),
      onError: (error) => notify.error(error.message || 'تعذر تحديث كلمة المرور'),
    })
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10" dir="rtl">
      <Card className="w-full max-w-lg">
        <CardHeader className="gap-4 text-center">
          <span className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary-subtle text-primary"><KeyRound className="size-8" /></span>
          <Badge variant="secondary" className="mx-auto"><CheckCircle2 /> تم التحقق من كلمة المرور المؤقتة</Badge>
          <div>
            <CardTitle className="text-2xl">أنشئ كلمة مرورك الجديدة</CardTitle>
            <CardDescription className="mt-2">لأمان حسابك، اختر كلمة مرور جديدة قبل متابعة إعداد مساحتك.</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-5">
            <Field data-invalid={Boolean(errors.newPassword)}>
              <FieldLabel htmlFor="new-password">كلمة المرور الجديدة</FieldLabel>
              <FieldContent><PasswordInput id="new-password" showGenerator {...register('newPassword')} error={errors.newPassword?.message} /></FieldContent>
            </Field>
            <Field data-invalid={Boolean(errors.confirmPassword)}>
              <FieldLabel htmlFor="confirm-password">تأكيد كلمة المرور الجديدة</FieldLabel>
              <FieldContent><PasswordInput id="confirm-password" showStrength={false} {...register('confirmPassword')} error={errors.confirmPassword?.message} /></FieldContent>
            </Field>
            <div className="flex items-start gap-2 rounded-lg bg-muted p-3 text-xs leading-6 text-text-muted"><ShieldCheck className="mt-1 size-4 shrink-0 text-primary" /> استخدم كلمة مرور يصعب تخمينها ولا تشاركها مع أي شخص.</div>
            <Button type="submit" size="lg" disabled={changePassword.isPending}>{changePassword.isPending ? 'جارٍ تفعيل الحساب...' : 'تفعيل الحساب'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
