import { useEffect, useState } from 'react'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useNavigate } from 'react-router-dom'
import {
  Bell,
  Building2,
  CheckCircle2,
  Home,
  Save,
  Settings,
  Settings as SettingsIcon,
  Wallet,
} from 'lucide-react'

import { Body, Breadcrumb, Text, Title } from '@teachedo/ui/legacy'
import { Button, Card, CardContent, PageHeader } from '@teachedo/ui/components'

import { useGetSettings } from '../api/settings.queries'
import { useUpdateSettings } from '../api/settings.mutations'
import { settingsSchema, type SettingsFormValues } from '../schemas/settings.schema'
import { BillingTab } from '../tabs/billing-tab'
import { GeneralTab } from '../tabs/general-tab'
import { NotificationsTab } from '../tabs/notifications-tab'
import { cn } from 'cn'

type SettingsTab = 'billing' | 'general' | 'notifications'

const tabItems: { key: SettingsTab; label: string; icon: typeof Wallet }[] = [
  { key: 'billing', label: 'الفواتير والاشتراكات', icon: Wallet },
  { key: 'general', label: 'هوية المنصة', icon: Building2 },
  { key: 'notifications', label: 'الإشعارات والتنبيهات', icon: Bell },
]

export default function SettingsPage() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<SettingsTab>('billing')
  const [showSuccessAlert, setShowSuccessAlert] = useState(false)
  const { data: response, isLoading } = useGetSettings()
  const { mutate: saveSettings, isPending: isSaving } = useUpdateSettings()
  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: response,
    mode: 'onBlur',
  })

  useEffect(() => {
    if (response) {
      form.reset(response)
    }
  }, [form, response])

  if (isLoading || !response) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-text-muted animate-pulse">
          <SettingsIcon size={32} className="animate-spin text-primary" strokeWidth={1.5} />
          <Title size="medium" className="text-text-muted">جاري تحميل إعدادات النظام...</Title>
        </div>
      </div>
    )
  }

  const handleSave = (values: SettingsFormValues) => {
    saveSettings(values, {
      onSuccess: () => {
        setShowSuccessAlert(true)
        setTimeout(() => setShowSuccessAlert(false), 4000)
      },
    })
  }

  return (
    <FormProvider {...form}>
      <form
        onSubmit={form.handleSubmit(handleSave)}
        noValidate
        className="mx-auto flex max-w-5xl flex-col gap-6 pb-10 animate-in fade-in duration-300"
      >
        <Breadcrumb
          showHome
          items={[
            { label: 'الرئيسية', icon: <Home />, href: '/' },
            { label: 'الاعدادات', href: '/', icon: <Settings /> },
          ]}
        />

        <PageHeader
          title="إعدادات النظام العامة"
          description="إدارة قواعد التسعير، دورات الفوترة للمستأجرين، وبيانات هويتكم التجارية."
          actions={(
            <>
              <Button type="button" variant="neutral-muted" onClick={() => navigate(-1)} disabled={isSaving}>
                إلغاء ورجوع
              </Button>
              <Button type="submit" disabled={isSaving}>
                <Save size={16} />
                {isSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
              </Button>
            </>
          )}
        />

        {showSuccessAlert && (
          <div className="flex items-center gap-3 rounded-sm bg-success-subtle p-2 animate-in fade-in slide-in-from-top-2">
            <CheckCircle2 size={16} strokeWidth={2} className="shrink-0 text-text" />
            <Text variant="body-medium" className="font-medium text-text">
              تم حفظ الإعدادات وتحديث بيانات النظام بنجاح.
            </Text>
          </div>
        )}

        <div className="flex flex-col items-start gap-6 md:flex-row">
          <Card size='sm'>
            <CardContent
              className='shrink-0 flex-col gap-1 overflow-auto max-md:flex-row md:w-64 w-full flex'
            >
              {tabItems.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.key
              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={cn(
                    'flex min-w-fit flex-col items-start rounded-[calc(var(--radius-md)-2px)] px-2.5 py-2 text-right transition-colors duration-200',
                    isActive ? 'bg-secondary text-secondary-foreground' : 'hover:bg-neutral-100',
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon size={18} strokeWidth={2} className={isActive ? 'text-secondary-foreground' : 'text-text'} />
                    <Body size="small" className={cn('m-0 font-medium', isActive ? 'text-secondary-foreground' : 'text-text')}>
                      {tab.label}
                    </Body>
                  </span>
                </button>
              )
            })}
            </CardContent>
          </Card>

          <main className="flex w-full min-w-0 flex-1 flex-col gap-5">
            {activeTab === 'billing' && <BillingTab />}
            {activeTab === 'general' && <GeneralTab />}
            {activeTab === 'notifications' && <NotificationsTab />}
          </main>
        </div>
      </form>
    </FormProvider>
  )
}
