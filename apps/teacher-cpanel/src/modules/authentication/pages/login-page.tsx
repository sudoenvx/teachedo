import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Mail,
  LockKeyhole,
  Presentation,
  Users,
  CalendarClock,
  ClipboardCheck,
  BookOpenCheck,
  Wallet,
  ShieldCheck,
  Bell,
  LayoutDashboard,
  type LucideIcon,
} from 'lucide-react'

import { Button, Input } from '@teachedo/ui'
import { useNotification } from '@/core/hooks/use_notification'
import { teacherLoginSchema, type TeacherLoginFormValues } from '@/modules/authentication/schema/teacher.schema'
import { useTeacherLogin } from '../api/auth.mutations'
import { useAssistantLogin } from '../api/auth.mutations'

// The real feature set, grounded in what the platform actually stores and
// does — not generic SaaS marketing copy. Swap/reorder freely as the
// product grows; the showcase below adapts to any length.
type Feature = {
  icon: LucideIcon
  iconBg: string
  iconColor: string
  title: string
  description: string
}

const FEATURES: Feature[] = [
  {
    icon: Users,
    iconBg: 'bg-success',
    iconColor: 'text-success-300',
    title: 'إدارة الطلاب وأولياء الأمور',
    description: 'اربط كل طالب بولي أمره، وتابع بياناتهم وحالتهم في مكان واحد.',
  },
  {
    icon: CalendarClock,
    iconBg: 'bg-accent',
    iconColor: 'text-accent-300',
    title: 'مجموعات وجداول متكررة',
    description: 'أنشئ مجموعاتك الدراسية بجدول أسبوعي ثابت، وحصص تُنشأ تلقائياً.',
  },
  {
    icon: ClipboardCheck,
    iconBg: 'bg-warning',
    iconColor: 'text-text',
    title: 'حضور وغياب بضغطة واحدة',
    description: 'سجّل حضور كل حصة فوراً، وراقب انتظام كل طالب أولاً بأول.',
  },
  {
    icon: BookOpenCheck,
    iconBg: 'bg-secondary-hover',
    iconColor: 'text-white',
    title: 'دروس واختبارات إلكترونية',
    description: 'شارك المحتوى الدراسي، وجهّز بنك أسئلة واختبارات مصححة تلقائياً.',
  },
  {
    icon: Wallet,
    iconBg: 'bg-success',
    iconColor: 'text-success-300',
    title: 'تتبع المدفوعات بالتفصيل',
    description: 'سجّل دفعة كل طالب شهرياً، واعرف من دفع ومن تأخر بلمحة واحدة.',
  },
  {
    icon: ShieldCheck,
    iconBg: 'bg-accent',
    iconColor: 'text-accent-300',
    title: 'صلاحيات مخصصة لمساعديك',
    description: 'أضف مساعدين لفريقك، وحدد بدقة ما يمكن لكل واحد الوصول إليه.',
  },
  {
    icon: Bell,
    iconBg: 'bg-warning',
    iconColor: 'text-text',
    title: 'إشعارات موجّهة',
    description: 'أرسل تنبيهاً لمجموعة، لطالب واحد، أو لجميع أولياء الأمور بضغطة.',
  },
  {
    icon: LayoutDashboard,
    iconBg: 'bg-secondary-hover',
    iconColor: 'text-white',
    title: 'لوحة تحكم تفصيلية',
    description: 'احصل على إحصائيات دقيقة لأداء مجموعاتك وإيراداتك.',
  },
]

const ROTATE_INTERVAL_MS = 4000

function FeatureShowcase() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % FEATURES.length)
    }, ROTATE_INTERVAL_MS)
    return () => clearInterval(timer)
  }, [isPaused])

  const active = FEATURES[activeIndex]
  const ActiveIcon = active.icon

  return (
    <div
      className="mt-4 w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        key={activeIndex}
        className="flex items-start gap-3 rounded-sm bg-white/5 p-2 animate-[fadeIn_0.4s_ease-out]"
      >
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-sm ${active.iconBg} ${active.iconColor}`}>
          <ActiveIcon size={17} />
        </div>
        <div>
          <h3 className="text-[13px] font-semibold text-white">{active.title}</h3>
          <p className="text-[11.5px] text-white/60 mt-0.5 leading-relaxed">{active.description}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 mt-3">
        {FEATURES.map((feature, index) => (
          <button
            key={feature.title}
            type="button"
            onClick={() => setActiveIndex(index)}
            aria-label={feature.title}
            aria-current={index === activeIndex}
            className={`h-1.5 rounded-xs transition-all duration-300 ${index === activeIndex ? 'w-8 bg-white/80' : 'w-3 bg-white/25 hover:bg-white/40'
              }`}
          />
        ))}
      </div>
    </div>
  )
}

export default function TeacherLoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { notify } = useNotification()
  const loginMutation = useTeacherLogin()
  const assistantLoginMutation = useAssistantLogin()
  const assistantMode = searchParams.get('mode') === 'assistant'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<TeacherLoginFormValues & { username?: string }>({
    resolver: zodResolver(assistantMode ? z.object({ username: z.string().min(3, 'اسم المستخدم غير صالح'), password: z.string().min(1, 'كلمة المرور مطلوبة') }) : teacherLoginSchema) as never,
  })

  const onSubmit = async (data: TeacherLoginFormValues) => {
    if (assistantMode) {
      await assistantLoginMutation.mutateAsync({ username: data.username || '', password: data.password }, {
        onSuccess: () => { localStorage.setItem('teacher-cpanel-role', 'assistant'); notify.success('مرحباً بك في لوحة العمل'); navigate(searchParams.get('redirect') || '/dashboard', { replace: true }) },
        onError: (error) => notify.error(error.message || 'بيانات الدخول غير صحيحة'),
      })
      return
    }
    await loginMutation.mutateAsync(data, {
      onSuccess: (result) => {
        localStorage.setItem('teacher-cpanel-role', 'teacher')
        notify.success('مرحباً بك في منصتك التعليمية')
        const redirectUrl = result.teacher.onboardingRequired ? '/onboarding' : (searchParams.get('redirect') || '/dashboard')
        navigate(redirectUrl, { replace: true })
      },
      onError: (error) => notify.error(error.message || 'بيانات الدخول غير صحيحة'),
    })
  }

  return (
    <div className="flex min-h-screen w-full bg-surface" dir="rtl">

      {/* النصف الأيمن: نموذج تسجيل الدخول (Flat & Clean) */}
      <div className="flex w-full flex-col justify-center px-6 py-12 sm:px-12 lg:w-1/2 xl:px-24">

        <div className="mx-auto flex w-full max-w-95 flex-col gap-8">

          {/* الشعار ونصوص الترحيب متسلسلة بشكل نظيف ومريح للعين */}
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-text">
                {assistantMode ? 'تسجيل دخول المساعد' : 'تسجيل دخول المدرس'}
              </h1>
              <p className="text-[13px] text-text-muted leading-relaxed">
                {assistantMode ? 'سجّل الدخول للوصول إلى المساحة التعليمية حسب الصلاحيات الممنوحة لك.' : 'أهلاً بك مجدداً في مساحتك التعليمية المستقلة. قم بتسجيل الدخول لإدارة طلابك، ومجموعاتك، ومحتواك الدراسي.'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">
            <Input
              label="اسم المستخدم"
              placeholder="assistant_username"
              variant="outline"
              size="lg"
              leadingIcon={<Mail size={18} />}
              {...register('username')}
              error={errors.username?.message}
              dir="ltr"
            />

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-medium text-text">كلمة المرور</label>
                <Link to="/forgot-password" className="text-[11px] font-medium text-accent hover:underline focus:outline-none">
                  نسيت كلمة المرور؟
                </Link>
              </div>
              <Input
                type="password"
                placeholder="••••••••"
                variant="outline"
                size="lg"
                leadingIcon={<LockKeyhole size={18} />}
                {...register('password')}
                error={errors.password?.message}
                dir="ltr"
                className='font-inter! placeholder:font-inter!'
              />
            </div>

            <Button
              type="submit"
              size="lg"
              color="primary"
              className="mt-2 w-full font-semibold rounded-sm justify-center"
              loading={loginMutation.isPending || assistantLoginMutation.isPending}
            >
              تسجيل الدخول
            </Button>
          </form>

          <Link
            to={assistantMode ? '/login' : '/login?mode=assistant'}
            className="text-center text-[11px] font-medium text-primary hover:underline"
          >
            {assistantMode ? 'تسجيل الدخول كمدرس' : 'تسجيل الدخول كمساعد'}
          </Link>

          {/* تذييل الفورم */}
          <div className="text-center text-[12px] text-text-muted mt-4">
            تحتاج إلى مساعدة؟ <a href="mailto:support@eduhub.com" className="text-accent font-medium hover:underline">تواصل مع الدعم الفني</a>
          </div>
        </div>
      </div>

      {/* النصف الأيسر: مساحة عرض الـ SaaS (صورة خلفية + Glassmorphism) */}
      <div className="hidden lg:flex lg:w-1/2 relative flex-col justify-center p-12 overflow-hidden bg-secondary-hover">

        {/* صورة الخلفية (استبدل الرابط بصورتك لاحقاً) */}
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-80 mix-blend-overlay"
          style={{ backgroundImage: "url('https://images.unsplash.com/photo-1739190714542-93b504c414bd?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NzJ8fGxlYXJuaW5nJTIwbWFuYWdlbWVudCUyMHN5c3RlbXxlbnwwfDF8MHx8fDA%3D')" }}
        />

        {/* تدرج لوني داكن (Gradient Overlay) ليجعل النصوص البيضاء مقروءة */}
        <div className="absolute inset-0 bg-linear-to-t from-[#0f1115] via-[#0f1115]/80 to-transparent" />

        <div className="relative z-10 flex w-full max-w-120 flex-col gap-8 self-center">

          <div className="flex h-14 w-14 items-center justify-center rounded-sm bg-white/10 text-white backdrop-blur-md mb-2">
            <Presentation size={28} strokeWidth={1.5} />
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold text-white tracking-tight">
              منصتك التعليمية، هويتك الخاصة
            </h2>
            <p className="text-[14px] text-white/70 leading-relaxed">
              نوفر لك بنية تحتية قوية لإدارة الكورسات، ومتابعة الطلاب، وتقديم الامتحانات الإلكترونية في مساحة معزولة ومخصصة لك بالكامل.
            </p>
          </div>

          {/* عرض دوّار للميزات — لأن قائمة الميزات أصبحت طويلة، نعرض ميزة واحدة
              بوضوح مع نقاط تنقّل بدل حشرها كلها في الشاشة دفعة واحدة. */}
          <FeatureShowcase />

        </div>
      </div>

    </div>
  )
}