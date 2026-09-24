import { CheckCircle2, Circle, LayoutDashboard, RotateCcw } from 'lucide-react'
import { useLocation, useNavigate } from 'react-router-dom'

import { Badge, Button, Card, CardContent, CardDescription, CardHeader, CardTitle, Separator } from '@teachedo/ui/components'

type OnboardingResult = {
  completed?: string[]
  skipped?: string[]
}

export default function OnboardingCompletePage() {
  const navigate = useNavigate()
  const location = useLocation()
  const result = (location.state as OnboardingResult | null) || {}
  const completed = result.completed || ['بيانات الحساب', 'المواد والصفوف', 'الهوية التعليمية']
  const skipped = result.skipped || ['المجموعة الأولى', 'الطلاب الأوائل']

  return (
    <main className="flex min-h-screen items-center justify-center bg-canvas px-4 py-8" dir="rtl">
      <Card className="w-full max-w-2xl">
        <CardHeader className="items-center text-center">
          <span className="flex size-16 items-center justify-center rounded-full bg-success-subtle text-success">
            <CheckCircle2 size={36} />
          </span>
          <Badge className="mt-4">تم إعداد مساحتك التعليمية</Badge>
          <CardTitle className="mt-2 text-3xl">كل شيء جاهز للبدء</CardTitle>
          <CardDescription className="max-w-lg leading-7">
            تم حفظ إعدادات حسابك. يمكنك الآن إدارة مجموعاتك وطلابك ومتابعة يومك من لوحة التحكم.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-5">
          <div className="rounded-xl border border-border bg-muted/20 p-4">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="font-semibold text-text">ما تم إنجازه</h2>
              <Badge variant="secondary">{completed.length} مكتمل</Badge>
            </div>
            <div className="space-y-3">
              {completed.map((item) => (
                <div key={item} className="flex items-center gap-3 text-sm text-text">
                  <CheckCircle2 className="text-success" size={18} />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {skipped.length > 0 && (
            <div className="rounded-xl border border-border p-4">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="font-semibold text-text">يمكنك إكماله لاحقاً</h2>
                <Badge variant="outline">{skipped.length} اختياري</Badge>
              </div>
              <div className="space-y-3">
                {skipped.map((item) => (
                  <div key={item} className="flex items-center gap-3 text-sm text-text-muted">
                    <Circle size={18} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Separator />
          <div className="flex flex-col gap-3 sm:flex-row">
            <Button className="flex-1" size="lg" onClick={() => navigate('/dashboard', { replace: true })}>
              <LayoutDashboard size={17} />
              الذهاب إلى لوحة التحكم
            </Button>
            {skipped.length > 0 && (
              <Button variant="outline" size="lg" onClick={() => navigate('/onboarding', { replace: true })}>
                <RotateCcw size={17} />
                إكمال البيانات
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </main>
  )
}
