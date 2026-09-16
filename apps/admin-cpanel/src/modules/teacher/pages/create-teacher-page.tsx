import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowLeft, Home, IdCard, KeyRound, LockKeyhole, Save, User, Key } from 'lucide-react'
import { Breadcrumb, Button, Card, Input, Select, Title } from '@teachedo/ui'
import { useNotification } from '@/core/hooks/use_notification'
import { createTeacherSchema, type CreateTeacherFormValues } from '../schemas/teachers.schemas'
import { useAddTeacher } from '../api/teachers.mutations'

const STATUS_OPTIONS = [
  { value: 'active', label: 'نشط (صلاحيات كاملة)' },
  { value: 'trial', label: 'فترة تجريبية' },
  { value: 'suspended_payment', label: 'موقوف (بسبب الدفع)' },
  { value: 'inactive', label: 'غير نشط' },
]

export default function CreateTeacherPage() {
  const navigate = useNavigate()
  const { notify } = useNotification()
  const addMutation = useAddTeacher()
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateTeacherFormValues>({
    resolver: zodResolver(createTeacherSchema),
    defaultValues: { accountStatus: 'active' },
  })
  const accountStatus = watch('accountStatus')

  const onSubmit = async (data: CreateTeacherFormValues) => {
    try {
      await addMutation.mutateAsync(data)
      notify.success('تم إنشاء حساب المدرس بنجاح')
      navigate('/teachers')
    } catch (error: any) {
      notify.error(error.message || 'حدث خطأ أثناء الإنشاء')
    }
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex w-full max-w-4xl flex-col gap-6 pb-8"
    >
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex flex-col gap-2">
          <Breadcrumb
            items={[
              { label: 'الرئيسية', href: '/', icon: <Home className="h-4 w-4" /> },
              { label: 'المدرسون', href: '/teachers' },
              { label: 'إنشاء حساب جديد' },
            ]}
          />
          <div>
            <Title element="h1" className="font-bold text-text">
              إضافة مدرس جديد
            </Title>
            <p className="m-0 mt-1 text-xs text-text-muted">
              أنشئ بيانات الدخول الأساسية، وسيكمل المدرس ملفه ومحتواه من خلال onboarding.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            color="neutral"
            size="sm"
            leftIcon={<ArrowLeft size={15} />}
            onClick={() => navigate(-1)}
          >
            رجوع
          </Button>
          <Button
            type="submit"
            color="primary"
            style="solid"
            size="sm"
            leftIcon={<Save size={15} />}
            loading={addMutation.isPending}
          >
            حفظ المدرس
          </Button>
        </div>
      </header>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card
          title="بيانات حساب المدرس"
          bodyClassName="">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Input
                label="الاسم الكامل"
                placeholder="مثال: أحمد محمود"
                leadingIcon={<User size={14} />}
                variant="outline"
                {...register('fullName')}
                error={errors.fullName?.message}
              />
            </div>
            <Input
              label="اسم المستخدم"
              placeholder="ahmed_physics"
              leadingIcon={<IdCard size={14} />}
              variant="outline"
              dir="ltr"
              {...register('username')}
              error={errors.username?.message}
            />
            <Input
              label="كلمة المرور المؤقتة"
              type="password"
              placeholder="********"
              leadingIcon={<KeyRound size={14} />}
              variant="outline"
              dir="ltr"
              {...register('password')}
              error={errors.password?.message}
            />
            <div className="sm:col-span-2">
              <Select
                label="حالة الحساب"
                value={accountStatus || 'active'}
                onChange={(value) =>
                  setValue('accountStatus', value as CreateTeacherFormValues['accountStatus'], {
                    shouldValidate: true,
                  })
                }
                options={STATUS_OPTIONS}
              />
              {errors.accountStatus && (
                <p className="mt-1 text-[11px] text-danger">{errors.accountStatus.message}</p>
              )}
            </div>
          </div>
          <div className="mt-6 flex items-start gap-2 border-t border-border-subtle pt-4 text-[11px] leading-6 text-text-muted">
            <LockKeyhole size={15} className="mt-1 shrink-0 text-primary" />
            <p className="m-0">
              بعد تسجيل الدخول، سيحدد المدرس هاتفه ومادته ومراحله ومجموعاته وجدوله بنفسه.
            </p>
          </div>
        </Card>
        <aside className="flex flex-col gap-4">
          <Card bodyClassName="p-3" className='shadow-none bg-info-subtle!'>
            <div className="flex items-start gap-2">
              <Key size={16} className="mt-0.5 shrink-0 text-info" />
              <div>
                <h2 className="text-[12px] font-bold text-info">مساحة مدرس مستقلة</h2>
                <p className="mt-1 text-[11px] leading-6 text-info-subtle-foreground">
                  سيُنشئ النظام مساحة معزولة للمدرس، ثم يكمل المدرس بياناته ومحتواه من خلال
                  onboarding.
                </p>
              </div>
            </div>
          </Card>
        </aside>
      </div>
    </form>
  )
}
