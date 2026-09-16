import { useEffect, useState } from 'react'
import { ArrowRight, KeyRound, Mail, Phone, Save, UserRound } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Breadcrumb, Button, Card, Input, PageHeader } from '@teachedo/ui'
import { useNotification } from '@/core/hooks/use_notification'
import { useAssistant, usePermissionCatalog, useUpdateAssistant } from '../api/assistants'
import { PermissionPicker } from '../components/permission-picker'

export default function AssistantEditPage() {
  const id = Number(useParams<{ id: string }>().id)
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { data: assistant, isLoading } = useAssistant(id)
  const { data: permissions = [] } = usePermissionCatalog()
  const update = useUpdateAssistant(id)
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    phoneNumber: '',
    password: '',
    permissionKeys: [] as string[],
  })
  useEffect(() => {
    if (assistant)
      setForm({
        fullName: assistant.fullName,
        username: assistant.username,
        email: assistant.email || '',
        phoneNumber: assistant.phoneNumber || '',
        password: '',
        permissionKeys: assistant.permissions.map((permission) => permission),
      })
  }, [assistant])
  if (isLoading || !assistant)
    return (
      <div className="flex h-[50vh] items-center justify-center text-[12px] text-text-muted">
        جاري تحميل المساعد...
      </div>
    )
  const save = async () => {
    try {
      await update.mutateAsync({ ...form, password: form.password || undefined })
      notify.success('تم تحديث المساعد')
      navigate('/assistants')
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'تعذر تحديث المساعد')
    }
  }
  return (
    <div className="flex flex-col gap-5 pb-10 animate-in fade-in duration-300">
      <Breadcrumb
        items={[{ label: 'المساعدون', href: '/assistants' }, { label: 'تعديل المساعد' }]}
      />
      <PageHeader
        title={<span className="flex items-center gap-2"><UserRound size={18} className="text-primary" />تعديل المساعد</span>}
        description={`حدّث بيانات ${assistant.fullName} وراجع نطاق الوصول الخاص به.`}
        actions={
          <div className="flex gap-2">
            <Link to="/assistants">
              <Button
                type="button"
                color="secondary"
                style="tint"
                size="sm"
                rightIcon={<ArrowRight size={14} />}
              >
                إلغاء
              </Button>
            </Link>
            <Button
              type="button"
              color="primary"
              size="sm"
              loading={update.isPending}
              rightIcon={<Save size={14} />}
              onClick={save}
            >
              حفظ التغييرات
            </Button>
          </div>
        }
      />
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,0.7fr)] lg:items-start">
        <Card title="بيانات الحساب" description="المعلومات الأساسية وبيانات الدخول." bodyClassName="p-4 sm:p-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="الاسم"
              leadingIcon={<UserRound size={14} />}
              value={form.fullName}
              onChange={(event) => setForm({ ...form, fullName: event.target.value })}
              variant="outline"
            />
            <Input
              label="اسم المستخدم"
              leadingIcon={<UserRound size={14} />}
              dir="ltr"
              value={form.username}
              onChange={(event) => setForm({ ...form, username: event.target.value })}
              variant="outline"
            />
            <Input
              label="البريد الإلكتروني"
              type="email"
              dir="ltr"
              leadingIcon={<Mail size={14} />}
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              variant="outline"
            />
            <Input
              label="الهاتف"
              leadingIcon={<Phone size={14} />}
              dir="ltr"
              value={form.phoneNumber}
              onChange={(event) => setForm({ ...form, phoneNumber: event.target.value })}
              variant="outline"
            />
            <Input
              label="كلمة مرور جديدة (اختياري)"
              type="password"
              dir="ltr"
              leadingIcon={<KeyRound size={14} />}
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              variant="outline"
            />
          </div>
        </Card>
        <PermissionPicker permissions={permissions} value={form.permissionKeys} onChange={(value) => setForm({ ...form, permissionKeys: value })} />
      </div>
    </div>
  )
}
