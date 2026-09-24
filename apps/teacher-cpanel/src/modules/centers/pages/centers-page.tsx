import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ArrowRight, MapPin, Phone, Plus, School } from 'lucide-react'
import { Badge, Button, Card, PageHeader } from '@teachedo/ui/components'
import { Breadcrumb } from '@teachedo/ui/legacy'
import { useCenters } from '../api/centers.queries'

export default function CentersPage() {
  const navigate = useNavigate()
  const { data: centers = [], isLoading } = useCenters()
  const commissionLabel = (center: typeof centers[number]) => {
    if (center.commissionType === 'percentage') return `${center.commission ?? 0}% عمولة`
    if (center.commissionType === 'fixed_per_student') return `${center.commission ?? 0} EGP / طالب`
    return 'بدون عمولة'
  }

  return (
    <div className="flex flex-col gap-4 pb-10">
      <Breadcrumb showHome items={[{ label: 'السناتر' }]} />
      <PageHeader
        title="السناتر"
        description="أدر أماكن التدريس التي تعمل بها واربطها بفصولك."
        actions={<div className="flex items-center gap-2"><Button variant="neutral" onClick={() => navigate('/')}><ArrowRight /> رجوع</Button><Button onClick={() => navigate('/centers/new')}><Plus /> سنتر جديد</Button></div>}
      />
      {isLoading ? <p className="py-10 text-center text-sm text-text-muted">جاري تحميل السناتر...</p> : centers.length === 0 ? (
        <Card className="items-center py-12 text-center">
          <School className="size-8 text-primary" />
          <h2 className="mt-3 font-bold">أضف أول سنتر</h2>
          <p className="mt-1 text-xs text-text-muted">سجّل بيانات المكان والعمولة لتستخدمه مع فصولك.</p>
          <Button className="mt-4" onClick={() => navigate('/centers/new')}><Plus /> إضافة سنتر</Button>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {centers.map((center) => (
            <Link key={center.id} to={`/centers/${center.id}`}>
              <Card className="group h-full gap-4 rounded-lg border border-border-subtle shadow-none transition-shadow hover:shadow-none">
                <div className="flex items-start justify-between gap-3">
                  <span className="flex size-11 items-center justify-center rounded-lg bg-primary-subtle text-primary"><School className="size-5" /></span>
                  <div className="flex items-center gap-2"><Badge variant="neutral">{center._count?.classes ?? 0} مجموعات</Badge><ArrowLeft className="size-4 text-text-faint transition-transform group-hover:-translate-x-1" /></div>
                </div>
                <div>
                  <h2 className="text-base font-bold text-text">{center.name}</h2>
                  <div className="mt-3 space-y-2 text-xs text-text-muted">
                    <p className="flex items-center gap-2"><MapPin className="size-3.5 text-primary" />{center.area || center.location || 'الموقع غير محدد'}</p>
                    {center.phoneNumber && <p className="flex items-center gap-2"><Phone className="size-3.5 text-primary" />{center.phoneNumber}</p>}
                  </div>
                  <div className="mt-4 flex items-center justify-between border-t border-border-subtle pt-3"><span className="text-[11px] text-text-muted">نظام العمولة</span><span className="text-xs font-bold text-primary">{commissionLabel(center)}</span></div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}