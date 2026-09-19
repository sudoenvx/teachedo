import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Mail, LockKeyhole, ShieldCheck, Lock } from 'lucide-react'

import { Button, Input } from '@teachedo/ui/legacy'
import { useNotification } from '@/core/hooks/use_notification'
import { useAdminLogin } from '../api/auth.mutations'
import { LOGO } from '@/core/assets'
import { adminLoginSchema, type AdminLoginFormValues } from '@/modules/auth/schemas/auth.schema'

export default function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { notify } = useNotification()
  const loginMutation = useAdminLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<AdminLoginFormValues>({
    resolver: zodResolver(adminLoginSchema),
  })

  const onSubmit = async (data: AdminLoginFormValues) => {
    await loginMutation.mutateAsync(data, {
      onSuccess: (response) => {
        localStorage.setItem('access_token', response.access_token)
        notify.success('تم تسجيل الدخول بنجاح')
        const redirectUrl = searchParams.get('redirect') || '/'
        navigate(redirectUrl, { replace: true })
      },
      onError: (error: any) => {
        notify.error(error.message || 'بيانات الدخول غير صحيحة')
      }
    })
  }

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center bg-secondary-hover p-4 overflow-hidden"
      dir="rtl"
    >


      {/* حاوية الفورم + إطار الزوايا (Reticle Frame) */}
      <div className="relative z-10 w-full max-w-105">
        <span aria-hidden className="pointer-events-none absolute -top-3 -right-3 h-6 w-6 rounded-tr-sm border-t-2 border-r-2 border-primary/50" />
        <span aria-hidden className="pointer-events-none absolute -top-3 -left-3 h-6 w-6 rounded-tl-sm border-t-2 border-l-2 border-primary/50" />
        <span aria-hidden className="pointer-events-none absolute -bottom-3 -right-3 h-6 w-6 rounded-br-sm border-b-2 border-r-2 border-primary/50" />
        <span aria-hidden className="pointer-events-none absolute -bottom-3 -left-3 h-6 w-6 rounded-bl-sm border-b-2 border-l-2 border-primary/50" />

        <div className="flex w-full flex-col rounded-sm bg-surface p-8 sm:p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.04)] animate-in fade-in zoom-in-95 duration-500">

          {/* الترويسة والشعار */}
          <div className="flex flex-col items-center gap-4 text-center mb-8">
            <div className="relative flex h-16 w-16 items-center justify-center rounded-md bg-[#1e1e24] shadow-inner border border-white/5 ring-4 ring-surface">
              <img src={LOGO} alt="EDU-HUB Logo" className="h-9 w-9 object-contain invert opacity-95" />
              <div className="absolute -bottom-1 -right-1 rounded-full bg-primary p-1 text-primary-foreground">
                <ShieldCheck size={14} strokeWidth={2.5} />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-inter font-semibold text-text tracking-tight">
                EDU-HUB CPANEL
              </h1>
              <p className="text-[13px] text-text-muted">
                لوحة تحكم الملّاك
              </p>

            </div>
          </div>

          {/* نموذج تسجيل الدخول */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

            <Input
              label="البريد الإلكتروني"
              type="email"
              placeholder="admin@example.com"
              size="lg"
              leadingIcon={<Mail size={18} />}
              {...register('email')}
              error={errors.email?.message}
              dir="ltr"
              className='font-inter!'
            />

            <Input
              label="كلمة المرور"
              type="password"
              placeholder="••••••••"
              size="lg"
              leadingIcon={<LockKeyhole size={18} />}
              {...register('password')}
              error={errors.password?.message}
              dir="ltr"
              className='font-inter!'
            />

            <Button
              type="submit"
              size="lg"
              color="primary"
              className="w-full mt-2 font-bold text-[14px] justify-center"
              loading={loginMutation.isPending}
            >
              الدخول للوحة التحكم
            </Button>

          </form>

          {/* ملاحظة أمنية — معلومة فعلية عن سياسة الوصول، وليست حشو زخرفي */}
          <div className="flex items-center justify-center gap-1.5 mt-6 text-[11px] text-text-muted">
            <Lock size={11} />
            <span>الوصول مقتصر على مالكي المنصة، وجميع محاولات الدخول مسجّلة</span>
          </div>
        </div>
      </div>

      {/* تذييل بسيط خارج الكارت */}
      <div className="absolute bottom-6 text-[11px] font-mono text-secondary-foreground/60">
        EDU-HUB CPANEL V1.0 — {new Date().getFullYear()}
      </div>

    </div>
  )
}