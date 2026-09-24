import { CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, CardContent } from '@teachedo/ui/components'

export default function WelcomePage() {
  const navigate = useNavigate()
  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-5 py-10" dir="rtl">
      <Card className="w-full max-w-xl">
        <CardContent className="flex flex-col items-center px-6 py-12 text-center sm:px-12">
          <span className="flex size-20 items-center justify-center rounded-full bg-success-subtle text-success"><CheckCircle2 className="size-10" /></span>
          <p className="mt-7 flex items-center gap-2 text-sm font-semibold text-primary"><Sparkles className="size-4" /> أهلاً بك في مساحتك</p>
          <h1 className="mt-3 text-3xl font-bold text-text">تم تفعيل حسابك</h1>
          <p className="mt-4 max-w-md text-sm leading-8 text-text-muted">أصبح حسابك جاهزاً. دعنا نكمل بعض البيانات البسيطة لتظهر مساحتك التعليمية بالشكل المناسب لك ولطلابك.</p>
          <Button type="button" size="lg" className="mt-8" onClick={() => navigate('/onboarding')}><ArrowLeft /> إكمال إعداد حسابك</Button>
        </CardContent>
      </Card>
    </div>
  )
}
