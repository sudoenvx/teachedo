import { Calendar, Clock, DollarSign, ShieldAlert } from 'lucide-react'
import { Controller, useFormContext } from 'react-hook-form'

import { Card, CardContent, CardHeader, CardTitle, Field, FieldContent, FieldDescription, FieldTitle } from '@teachedo/ui/components'
import { Switch } from '@teachedo/ui/legacy'

import type { SettingsFormValues } from '../schemas/settings.schema'
import { SettingsField } from './settings-field'

export function BillingTab() {
  const { control } = useFormContext<SettingsFormValues>()

  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign size={14} />
            <span>نموذج التسعير والمحاسبة (SaaS)</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 sm:grid-cols-2">
            <SettingsField
              name="price_per_student"
              label="السعر الافتراضي لكل طالب شهرياً"
              type="number"
              description="سعر الاشتراك الأساسي لكل طالب نشط، يطبق على المدرسين الجدد."
              endContent={useFormContext<SettingsFormValues>().watch('currency')}
            />
            <SettingsField
              name="currency"
              label="العملة الرسمية للنظام"
              disabled
              dir="ltr"
              description="رمز العملة المعروض في الفواتير (مثال: EGP, SAR)."
            />
            <SettingsField
              name="trial_days"
              label="فترة التجربة المجانية (أيام)"
              type="number"
              description="عدد الأيام الممنوحة مجاناً عند إنشاء حساب المدرس."
              startIcon={<Calendar size={14} />}
            />
            <SettingsField
              name="billing_cycle_days"
              label="دورة الفوترة (أيام)"
              type="number"
              disabled
              description="الفترة الزمنية بين كل فاتورة والأخرى (افتراضياً 30 يوماً)."
              startIcon={<Clock size={14} />}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldAlert size={14} />
            <span>سياسة الحسابات المتأخرة والعقوبات</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-5">
            <SettingsField
              name="grace_period_days"
              label="فترة السماح (أيام)"
              type="number"
              description="أيام السماح بعد إصدار الفاتورة قبل اتخاذ إجراء التعليق."
              startIcon={<Clock size={14} />}
            />
            <Controller
              name="auto_suspend_unpaid"
              control={control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <FieldContent>
                    <FieldTitle>التعليق التلقائي للمتأخرين</FieldTitle>
                    <FieldDescription>
                      إيقاف لوحة تحكم المدرس فور انتهاء فترة السماح وعدم السماح بدخول نظامه.
                    </FieldDescription>
                  </FieldContent>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    aria-label="التعليق التلقائي للمتأخرين"
                  />
                </Field>
              )}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
