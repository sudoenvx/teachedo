import { useNavigate, useSearchParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2, Lock, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from '@teachedo/ui/components'
import { useNotification } from '@/core/hooks/use_notification'
import { useAdminLogin } from '../api/auth.mutations'
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
      onError: (error) => {
        notify.error(error.message || 'بيانات الدخول غير صحيحة')
      }
    })
  }

  return (
    <div
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-surface p-4"
      dir="rtl"
    >
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-canvas bg-cover bg-no-repeat"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1614849286521-4c58b2f0ff15?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D')",
        }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-black/50" />

      <Card className="relative z-10 w-full max-w-md border-white/70 bg-surface/95 p-1 shadow-sm animate-in fade-in zoom-in-95 duration-500">
        <CardHeader className="items-center px-7 pt-7 text-center sm:px-9 sm:pt-9">
          <div className="relative mb-3 flex h-14 w-14 items-center justify-center rounded-sm bg-neutral-100">
            <img src={'/logo.png'} alt="Teachedo" className="h-12 w-12 object-contain" />
            <span className="absolute -bottom-1 -right-1 flex size-5 items-center justify-center rounded-full bg-surface text-primary shadow-sm">
              <ShieldCheck size={13} strokeWidth={2.5} />
            </span>
          </div>
          <CardTitle className="text-xl font-bold tracking-tight">EDU-HUB CPANEL</CardTitle>
          <CardDescription className="mt-1 text-[13px]">لوحة تحكم الملّاك</CardDescription>
        </CardHeader>

        <CardContent className="px-7 pb-7 sm:px-9 sm:pb-9">
          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-email" className="text-xs font-medium text-text">البريد الإلكتروني</label>
              <InputGroup className={errors.email ? 'border-destructive' : undefined}>
                <InputGroupAddon align="inline-start"><InputGroupText><Mail size={16} /></InputGroupText></InputGroupAddon>
                <InputGroupInput
                  id="admin-email"
                  type="email"
                  placeholder="admin@example.com"
                  dir="ltr"
                  className='h-10!'
                  autoComplete="email"
                  aria-invalid={Boolean(errors.email)}
                  {...register('email')}
                />
              </InputGroup>
              {errors.email?.message && <p className="m-0 text-[11px] text-destructive">{errors.email.message}</p>}
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-password" className="text-xs font-medium text-text">كلمة المرور</label>
              <InputGroup className={errors.password ? 'border-destructive' : undefined}>
                <InputGroupAddon align="inline-start"><InputGroupText><LockKeyhole size={16} /></InputGroupText></InputGroupAddon>
                <InputGroupInput
                  id="admin-password"
                  type="password"
                  placeholder="••••••••"
                  dir="ltr"
                  autoComplete="current-password"
                  aria-invalid={Boolean(errors.password)}
                  {...register('password')}
                />
              </InputGroup>
              {errors.password?.message && <p className="m-0 text-[11px] text-destructive">{errors.password.message}</p>}
            </div>

            <Button type="submit" size="lg" className="mt-2 w-full justify-center" disabled={loginMutation.isPending}>
              {loginMutation.isPending && <Loader2 className="animate-spin" aria-hidden="true" />}
              {loginMutation.isPending ? 'جاري تسجيل الدخول...' : 'الدخول للوحة التحكم'}
            </Button>
          </form>

          <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-text-muted">
            <Lock size={11} aria-hidden="true" />
            <span>الوصول مقتصر على مالكي المنصة، وجميع محاولات الدخول مسجّلة</span>
          </div>
        </CardContent>
      </Card>

      <div className="absolute bottom-5 z-10 text-[11px] font-medium text-white/80">
        EDU-HUB CPANEL V1.0 — {new Date().getFullYear()}
      </div>
    </div>
  )
}