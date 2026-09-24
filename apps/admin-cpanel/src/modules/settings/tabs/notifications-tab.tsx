import { Bell, Info } from 'lucide-react'
import { Controller, useFormContext } from 'react-hook-form'

import { Card, CardContent, CardHeader, CardTitle, Field, FieldContent, FieldDescription, FieldTitle, Switch } from '@teachedo/ui/components'

import type { SettingsFormValues } from '../schemas/settings.schema'

export function NotificationsTab() {
  const { control } = useFormContext<SettingsFormValues>()

  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell size={14} />
            <span>سياسات الإشعارات وتقارير الأداء</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Controller
              name="notify_on_payment_overdue"
              control={control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>تنبيه تأخر السداد</FieldTitle>
                    <FieldDescription>
                      إرسال إشعار فوري لمديري النظام عند تخطي أي مدرس لفترة السماح.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="تنبيه تأخر السداد"
                  />
                </Field>
              )}
            />

            <div className="mt-2 flex items-start gap-3 rounded-sm bg-info-subtle p-2">
              <Info size={18} className="mt-0.5 shrink-0 text-info-subtle-text" />
              <p className="m-0 text-xs/relaxed font-medium leading-relaxed text-info-subtle-text">
                نظام الإشعارات الآلي يعتمد على خدمة الـ Cron Jobs المجدولة. سيتم إرسال التقارير أسبوعياً كل يوم أحد في تمام الساعة 8 صباحاً بتوقيت الخادم.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
