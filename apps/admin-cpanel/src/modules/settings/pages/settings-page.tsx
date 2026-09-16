import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Wallet,
  Bell,
  Save,
  Building2,
  CheckCircle2,
  Calendar,
  DollarSign,
  Globe,
  Mail,
  Phone,
  Clock,
  Info,
  Settings as SettingsIcon,
  ShieldAlert,
  Home,
  Settings
} from 'lucide-react'

import {
  Button,
  Input,
  SwitchTile,
  Title,
  Body,
  Text,
  PageHeader,
  Breadcrumb,
  Card
} from '@teachedo/ui'

import type { SystemSettings } from '../types/settings.types'
import { useGetSettings } from '../api/settings.queries'
import { useUpdateSettings } from '../api/settings.mutations'
import { cn } from '@/core/utils'

type SettingsTab = 'billing' | 'general' | 'notifications'

const tabItems: { key: SettingsTab; label: string; icon: typeof Wallet; desc: string }[] = [
  { key: 'billing', label: 'الفواتير والاشتراكات', icon: Wallet, desc: 'التسعير، دورات الفوترة وفترات السماح' },
  { key: 'general', label: 'هوية المنصة', icon: Building2, desc: 'الاسم التجاري وبيانات الدعم الفني' },
  { key: 'notifications', label: 'الإشعارات والتنبيهات', icon: Bell, desc: 'التقارير الدورية وتنبيهات النظام' },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<SettingsTab>('billing')
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)

  const { data: response, isLoading } = useGetSettings()
  const { mutate: saveSettings, isPending: isSaving } = useUpdateSettings()

  const [formData, setFormData] = useState<SystemSettings | null>(null)

  useEffect(() => {
    if (response) {
      setFormData(response)
    }
  }, [response])

  if (isLoading || !formData) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-text-muted animate-pulse">
          <SettingsIcon size={32} className="animate-spin text-primary" strokeWidth={1.5} />
          <Title size="medium" className="text-text-muted">جاري تحميل إعدادات النظام...</Title>
        </div>
      </div>
    )
  }

  const handleChange = <K extends keyof SystemSettings>(field: K, value: SystemSettings[K]) => {
    setFormData((prev) => (prev ? { ...prev, [field]: value } : null))
  }

  const handleSave = () => {
    if (!formData) return
    saveSettings(formData, {
      onSuccess: () => {
        setShowSuccessAlert(true)
        setTimeout(() => setShowSuccessAlert(false), 4000)
      },
    })
  }

  return (
    <div className="flex flex-col max-w-5xl mx-auto gap-6 animate-in fade-in duration-300 pb-10">
      <Breadcrumb
        showHome={true}

        items={[
          {
            label: 'الرئيسية',
            icon: <Home />,
            href: '/'
          },
          {
            label: 'الاعدادات',
            href: '/',
            icon: <Settings />,
            onClick() {

            },
          }
        ]}
      />

      {/* 1. الترويسة العلوية وأزرار الإجراءات */}
      <PageHeader
        title="إعدادات النظام العامة"
        description="إدارة قواعد التسعير، دورات الفوترة للمستأجرين، وبيانات هويتكم التجارية."
        actions={
          <>
            <Button color="neutral" style="surface" size="sm" onClick={() => navigate(-1)} disabled={isSaving}>
              إلغاء ورجوع
            </Button>
            <Button size="sm" onClick={handleSave} loading={isSaving} leftIcon={<Save size={16} />}>
              حفظ التغييرات
            </Button>
          </>
        }
      />

      {/* رسالة النجاح (Alert) */}
      {showSuccessAlert && (
        <div className="flex items-center gap-3 p-2 rounded-sma bg-success-subtle animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={16} strokeWidth={2} className="text-text shrink-0" />
          <Text variant="body-medium" className="text-text font-medium">
            تم حفظ الإعدادات وتحديث بيانات النظام بنجاح.
          </Text>
        </div>
      )}

      {/* 2. تخطيط الشبكة: القائمة الجانبية (Tabs) بجوار المحتوى */}
      <div className="flex flex-col md:flex-row gap-6 items-start">

        {/* --- القائمة الجانبية للتبويبات --- */}
        <aside className="w-full md:w-64 shrink-0 flex flex-col overflow-auto max-md:flex-row max-md:bg-surface max-md:p-1.5 gap-2">
          {tabItems.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "flex flex-col items-start p-2 max-md:py-1.5 px-2.5 rounded-sm text-right min-w-fit transition-colors duration-200",
                  isActive
                    ? "rounded-xs bg-primary surface "
                    : "bg-neutral-100 hover:bg-neutral-200"
                )}
              >
                <div className="flex items-center gap-2">
                  <Icon size={18} strokeWidth={2} className={isActive ? "text-primary-foreground" : "text-text"} />
                  <Body size="small" className={cn("m-0 font-medium", isActive ? "text-primary-foreground" : "text-text")}>
                    {tab.label}
                  </Body>
                </div>
                {/* <Body size="small" className={cn("m-0 mt-0.5", isActive ? "text-text" : "text-text-muted")}>
                  {tab.desc}
                </Body> */}
              </button>
            )
          })}
        </aside>

        {/* --- منطقة المحتوى النشط --- */}
        <main className="flex-1 min-w-0 flex flex-col gap-5 w-full">

          {/* === محتوى: الفواتير والتسعير === */}
          {activeTab === 'billing' && (
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2">

              <Card
                title={
                  <div className="flex items-center gap-2 ">
                    <DollarSign size={14} className="" />
                    <span>نموذج التسعير والمحاسبة (SaaS)</span>
                  </div>
                }
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="السعر الافتراضي لكل طالب شهرياً"
                    type="number"
                    value={formData.price_per_student}
                    onChange={(e) => handleChange('price_per_student', Number(e.target.value))}
                    variant="outline"
                    hint="سعر الاشتراك الأساسي لكل طالب نشط، يطبق على المدرسين الجدد."
                    trailingIcon={<Text variant="label-medium" className="text-text-muted px-1">{formData.currency}</Text>}
                  />
                  <Input
                    label="العملة الرسمية للنظام"
                    disabled
                    value={formData.currency}
                    onChange={(e) => handleChange('currency', e.target.value)}
                    variant="outline"
                    hint="رمز العملة المعروض في الفواتير (مثال: EGP, SAR)."
                    dir="ltr"
                    className="text-left font-inter"
                  />
                  <Input
                    label="فترة التجربة المجانية (أيام)"
                    type="number"
                    value={formData.trial_days}
                    onChange={(e) => handleChange('trial_days', Number(e.target.value))}
                    variant="outline"
                    hint="عدد الأيام الممنوحة مجاناً عند إنشاء حساب المدرس."
                    trailingIcon={<Calendar size={14} className="text-text-muted" />}
                  />
                  <Input
                    label="دورة الفوترة (أيام)"
                    disabled
                    type="number"
                    value={formData.billing_cycle_days}
                    onChange={(e) => handleChange('billing_cycle_days', Number(e.target.value))}
                    variant="outline"
                    hint="الفترة الزمنية بين كل فاتورة والأخرى (افتراضياً 30 يوماً)."
                    trailingIcon={<Clock size={14} className="text-text-muted" />}
                  />
                </div>
              </Card>

              <Card
                title={
                  <div className="flex items-center gap-2">
                    <ShieldAlert size={14} />
                    <span>سياسة الحسابات المتأخرة والعقوبات</span>
                  </div>
                }
              >
                <div className="flex flex-col gap-5">
                  <Input
                    label="فترة السماح (أيام)"
                    type="number"
                    value={formData.grace_period_days}
                    onChange={(e) => handleChange('grace_period_days', Number(e.target.value))}
                    variant="outline"
                    hint="أيام السماح بعد إصدار الفاتورة قبل اتخاذ إجراء التعليق."
                    trailingIcon={<Clock size={14} className="text-text-muted" />}
                  />
                  <SwitchTile
                    label="التعليق التلقائي للمتأخرين"
                    description="إيقاف لوحة تحكم المدرس فور انتهاء فترة السماح وعدم السماح بدخول نظامه."
                    checked={formData.auto_suspend_unpaid}
                    onCheckedChange={(val) => handleChange('auto_suspend_unpaid', val)}
                  />
                </div>
              </Card>

            </div>
          )}

          {/* === محتوى: الإعدادات العامة === */}
          {activeTab === 'general' && (
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2">

              <Card
                title={
                  <div className="flex items-center gap-2">
                    <Building2 size={14} />
                    <span>هوية المنصة وبيانات الأساسية</span>
                  </div>
                }
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="اسم المنصة التجاري"
                    value={formData.business_name}
                    onChange={(e) => handleChange('business_name', e.target.value)}
                    variant="outline"
                    hint="الاسم الذي يظهر في الفواتير والرسائل الموجهة للمستأجرين."
                  />
                  <Input
                    label="لغة النظام الافتراضية"
                    disabled
                    value={formData.default_language}
                    onChange={(e) => handleChange('default_language', e.target.value)}
                    variant="outline"
                    hint="رمز اللغة الافتراضي لواجهات النظام (ar أو en)."
                    dir="ltr"
                    className="text-left font-inter"
                    trailingIcon={<Globe size={14} className="text-text-muted" />}
                  />
                </div>
              </Card>

              <Card
                title={
                  <div className="flex items-center gap-2">
                    <Phone size={14} />
                    <span>بيانات التواصل والدعم الفني</span>
                  </div>
                }
              >
                <div className="grid gap-5 sm:grid-cols-2">
                  <Input
                    label="البريد الإلكتروني للدعم"
                    type="email"
                    value={formData.support_email}
                    onChange={(e) => handleChange('support_email', e.target.value)}
                    variant="outline"
                    hint="البريد المخصص لتلقي استفسارات المدرسين."
                    dir="ltr"
                    className="text-left font-inter"
                    trailingIcon={<Mail size={14} className="text-text-muted" />}
                  />
                  <Input
                    label="رقم التواصل (واتساب)"
                    type="tel"
                    value={formData.support_phone}
                    onChange={(e) => handleChange('support_phone', e.target.value)}
                    variant="outline"
                    hint="الرقم المعروض للمدرسين لطلب الدعم الفوري."
                    dir="ltr"
                    className="text-left font-inter"
                    trailingIcon={<Phone size={14} className="text-text-muted" />}
                  />
                </div>
              </Card>
            </div>
          )}

          {/* === محتوى: الإشعارات === */}
          {activeTab === 'notifications' && (
            <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2">
              <Card
                title={
                  <div className="flex items-center gap-2">
                    <Bell size={14} />
                    <span>سياسات الإشعارات وتقارير الأداء</span>
                  </div>
                }
              >
                <div className="flex flex-col gap-4">
                  <SwitchTile
                    label="تنبيه تأخر السداد"
                    description="إرسال إشعار فوري لمديري النظام عند تخطي أي مدرس لفترة السماح."
                    checked={formData.notify_on_payment_overdue}
                    onCheckedChange={(val) => handleChange('notify_on_payment_overdue', val)}
                  />
                  {/* <SwitchTile
                    label="التقرير الأسبوعي للنمو"
                    description="توليد وإرسال ملخص أسبوعي آلي إلى بريد الإدارة يتضمن إحصائيات المدرسين والفواتير المحصلة."
                    checked={formData.weekly_system_report}
                    onCheckedChange={(val) => handleChange('weekly_system_report', val)}
                  /> */}

                  <div className="mt-2 flex items-start gap-3 bg-info-subtle p-2 rounded-sm ">
                    <Info size={18} className="text-info-subtle-text shrink-0 mt-0.5" />
                    <Body size="small" className="text-info-subtle-text font-medium m-0 leading-relaxed">
                      نظام الإشعارات الآلي يعتمد على خدمة الـ Cron Jobs المجدولة. سيتم إرسال التقارير أسبوعياً كل يوم أحد في تمام الساعة 8 صباحاً بتوقيت الخادم.
                    </Body>
                  </div>
                </div>
              </Card>
            </div>
          )}

        </main>
      </div>
    </div>
  )
}