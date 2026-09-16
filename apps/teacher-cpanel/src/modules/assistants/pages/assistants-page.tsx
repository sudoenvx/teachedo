import { useState } from 'react'
import { Edit3, KeyRound, Mail, Plus, ShieldCheck, Trash2, UserRound } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import {
  Badge,
  Button,
  DataTable,
  IconButton,
  Input,
  Modal,
  Popover,
  PageHeader,
  Breadcrumb,
  type DataTableColumn,
} from '@teachedo/ui'
import { useNotification } from '@/core/hooks/use_notification'
import {
  useAssistants,
  useCreateAssistant,
  useDeleteAssistant,
  usePermissionCatalog,
  type Assistant,
  type AssistantInput,
} from '../api/assistants'
import { PermissionPicker } from '../components/permission-picker'

const emptyForm: AssistantInput = {
  fullName: '',
  username: '',
  email: '',
  password: '',
  phoneNumber: '',
  permissionKeys: [],
}
export default function AssistantsPage() {
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { data: result, isLoading } = useAssistants()
  const { data: permissions = [] } = usePermissionCatalog()
  const create = useCreateAssistant()
  const remove = useDeleteAssistant()
  const [form, setForm] = useState(emptyForm)
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState<Assistant | null>(null)
  const set = (key: keyof AssistantInput, value: string | string[]) =>
    setForm((current) => ({ ...current, [key]: value }))
  const submit = async () => {
    try {
      await create.mutateAsync(form)
      notify.success('تم إنشاء المساعد')
      setOpen(false)
      setForm(emptyForm)
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'تعذر إنشاء المساعد')
    }
  }
  const columns: DataTableColumn<Assistant>[] = [
    {
      header: 'المساعد',
      render: (item) => (
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-sm bg-primary-subtle text-primary">
            <UserRound size={15} />
          </span>
          <span className="text-[12px] font-bold text-text">{item.fullName}</span>
        </div>
      ),
    },
    {
      header: 'اسم المستخدم',
      accessor: 'username',
      render: (item) => <span className="font-inter text-[12px] text-text-muted">{item.username}</span>,
    },
    {
      header: 'الصلاحيات',
      render: (item) => <PermissionSummary assistant={item} permissions={permissions} />,
    },
    {
      header: 'الإجراءات',
      render: (item) => (
        <div className="flex gap-1">
          <IconButton
            type="button"
            color="secondary"
            style="tint"
            size="sm"
            title="تعديل الصلاحيات"
            aria-label="تعديل الصلاحيات"
            icon={<Edit3 size={14} />}
            onClick={() => navigate(`/assistants/${item.id}/edit`)}
          />
          <IconButton
            type="button"
            color="danger"
            style="tint"
            size="sm"
            title="حذف المساعد"
            aria-label="حذف المساعد"
            icon={<Trash2 size={14} />}
            onClick={() => setDeleting(item)}
          />
        </div>
      ),
    },
  ]
  return (
    <div className="flex flex-col gap-4 pb-10 animate-in fade-in duration-300">
      <Breadcrumb showHome items={[{ label: 'المساعدون' }]} />
      <PageHeader
        title="المساعدون"
        description="أضف فريقك وحدد ما يمكن لكل مساعد الوصول إليه."
        actions={
          <Button
            type="button"
            color="primary"
            size="sm"
            leftIcon={<Plus size={14} />}
            onClick={() => setOpen(true)}
          >
            إضافة مساعد
          </Button>
        }
      />
      <DataTable
        title={
          <span className="flex items-center gap-2">
            قائمة المساعدين{' '}
            <Badge variant="neutral" size="sm">
              {result?.meta?.total || 0}
            </Badge>
          </span>
        }
        data={result?.data || []}
        columns={columns}
        getRowId={(item) => String(item.id)}
        loading={isLoading}
      />
      <Modal
        open={open}
        onClose={() => setOpen(false)}
        size="lg"
        title="إضافة مساعد جديد"
        description="أنشئ حساب مساعد وحدد نطاق الوصول من مكان واحد."
        footer={
          <>
            <Button
              type="button"
              color="secondary"
              style="tint"
              size="sm"
              onClick={() => setOpen(false)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              color="primary"
              size="sm"
              loading={create.isPending}
              onClick={submit}
            >
              حفظ المساعد
            </Button>
          </>
        }
      >
        <div className="flex flex-col gap-5">
          <div className="grid gap-4 rounded-sm border border-border-subtle bg-surface-secondary p-3 sm:grid-cols-2">
            <Input
              label="الاسم"
              value={form.fullName}
              onChange={(event) => set('fullName', event.target.value)}
              leadingIcon={<UserRound size={14} />}
            />
            <Input
              label="اسم المستخدم"
              dir="ltr"
              value={form.username}
              onChange={(event) => set('username', event.target.value)}
              leadingIcon={<UserRound size={14} />}
              variant="outline"
            />
            <Input
              label="البريد الإلكتروني (اختياري)"
              type="email"
              dir="ltr"
              value={form.email || ''}
              onChange={(event) => set('email', event.target.value)}
              leadingIcon={<Mail size={14} />}
              variant="outline"
            />
            <Input
              label="كلمة المرور"
              type="password"
              dir="ltr"
              value={form.password}
              onChange={(event) => set('password', event.target.value)}
              leadingIcon={<KeyRound size={14} />}
              variant="outline"
            />
            <Input
              label="الهاتف (اختياري)"
              dir="ltr"
              value={form.phoneNumber || ''}
              onChange={(event) => set('phoneNumber', event.target.value)}
              variant="outline"
            />
          </div>
          <PermissionPicker permissions={permissions} value={form.permissionKeys} onChange={(value) => set('permissionKeys', value)} />
        </div>
      </Modal>
      <Modal
        open={!!deleting}
        onClose={() => setDeleting(null)}
        size="sm"
        footer={
          <>
            <Button
              type="button"
              color="secondary"
              style="tint"
              size="sm"
              onClick={() => setDeleting(null)}
            >
              إلغاء
            </Button>
            <Button
              type="button"
              color="danger"
              size="sm"
              loading={remove.isPending}
              onClick={async () => {
                if (deleting) {
                  await remove.mutateAsync({ id: deleting.id })
                  setDeleting(null)
                  notify.success('تم حذف المساعد')
                }
              }}
            >
              حذف
            </Button>
          </>
        }
      >
        <p className="text-[13px] text-text">هل تريد حذف المساعد {deleting?.fullName}؟</p>
      </Modal>
    </div>
  )
}

function PermissionSummary({ assistant, permissions }: { assistant: Assistant; permissions: { key: string; label: string | null }[] }) {
  const labels = assistant.permissions.map(
    (key) => permissions.find((permission) => permission.key === key)?.label || key
  )

  return (
    <Popover
      align="start"
      side="bottom"
      contentClassName="w-64 border border-border-subtle p-3"
      trigger={
        <button
          type="button"
          className="group inline-flex items-center gap-2 rounded-sm px-1.5 py-1 transition-colors hover:bg-primary-subtle focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-focus-ring"
          aria-label={`عرض صلاحيات ${assistant.fullName}`}
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-sm bg-primary-subtle text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
            <ShieldCheck size={15} />
          </span>
          <span className="text-start">
            <span className="block text-[11px] font-bold text-text">عرض الصلاحيات</span>
            <span className="block text-[10px] text-text-muted">{labels.length} صلاحيات</span>
          </span>
        </button>
      }
    >
      <div>
        <div className="mb-2 flex items-center justify-between gap-2 border-b border-border-subtle pb-2">
          <h3 className="text-[12px] font-bold text-text">صلاحيات {assistant.fullName}</h3>
          <Badge variant="primary" size="sm">{labels.length}</Badge>
        </div>
        {labels.length ? (
          <div className="flex flex-col gap-1.5">
            {labels.map((label, index) => (
              <div key={`${assistant.id}-${assistant.permissions[index]}`} className="flex items-center gap-2 rounded-sm bg-surface-secondary px-2 py-1.5 text-[11px] text-text">
                <ShieldCheck size={13} className="shrink-0 text-primary" />
                <span className="truncate">{label}</span>
              </div>
            ))}
          </div>
        ) : (
          <p className="m-0 text-[11px] text-text-muted">لا توجد صلاحيات مخصصة.</p>
        )}
      </div>
    </Popover>
  )
}
