import { Globe, Mail, Phone, Building2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@teachedo/ui/components'

import { SettingsField } from './settings-field'

export function GeneralTab() {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 size={14} />
            <span>هوية المنصة وبيانات الأساسية</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 sm:grid-cols-2">
            <SettingsField
              name="business_name"
              label="اسم المنصة التجاري"
              description="الاسم الذي يظهر في الفواتير والرسائل الموجهة للمستأجرين."
            />
            <SettingsField
              name="default_language"
              label="لغة النظام الافتراضية"
              disabled
              dir="ltr"
              description="رمز اللغة الافتراضي لواجهات النظام (ar أو en)."
              startIcon={<Globe size={14} />}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Phone size={14} />
            <span>بيانات التواصل والدعم الفني</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-5 sm:grid-cols-2">
            <SettingsField
              name="support_email"
              label="البريد الإلكتروني للدعم"
              type="email"
              dir="ltr"
              description="البريد المخصص لتلقي استفسارات المدرسين."
              startIcon={<Mail size={14} />}
            />
            <SettingsField
              name="support_phone"
              label="رقم التواصل (واتساب)"
              type="tel"
              dir="ltr"
              description="الرقم المعروض للمدرسين لطلب الدعم الفوري."
              startIcon={<Phone size={14} />}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
