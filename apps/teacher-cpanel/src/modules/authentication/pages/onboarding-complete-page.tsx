import { ArrowLeft, CheckCircle2, LayoutDashboard } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, Card } from '@teachedo/ui'

export default function OnboardingCompletePage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10" dir="rtl">
      <Card className="w-full max-w-lg" bodyClassName="p-7 text-center sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success-subtle text-success">
          <CheckCircle2 size={34} />
        </span>
        <p className="mt-6 text-[11px] font-semibold text-primary">تم تجهيز مساحتك التعليمية</p>
        <h1 className="mt-2 text-2xl font-bold text-text">كل شيء جاهز للبدء</h1>
        <p className="mx-auto mt-3 max-w-sm text-[13px] leading-7 text-text-muted">
          اكتمل إعداد حسابك بنجاح. يمكنك الآن إضافة الطلاب وتنظيم مجموعاتك ومتابعة يومك من لوحة التحكم.
        </p>
        <Button type="button" color="primary" style="solid" size="md" className="mt-7" rightIcon={<LayoutDashboard size={15} />} onClick={() => navigate('/dashboard', { replace: true })}>
          الانتقال إلى لوحة التحكم
        </Button>
        <button type="button" className="mx-auto mt-4 flex items-center gap-1 text-[11px] text-text-muted hover:text-text" onClick={() => navigate('/groups/new')}>
          ابدأ بإنشاء مجموعة <ArrowLeft size={12} />
        </button>
      </Card>
    </div>
  )
}
