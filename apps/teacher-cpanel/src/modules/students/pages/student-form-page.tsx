import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { IdCard, KeyRound, Phone, Save, UserRound, UsersRound } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Breadcrumb, Button, Card, Checkbox, ImageUpload, Input, PageHeader, Select } from '@teachedo/ui'
import { useNotification } from '@/core/hooks/use_notification'
import { useCreateStudent, useUpdateStudent } from '../api/students.mutations'
import { useEnrollStudent } from '../api/student-enrollment.mutations'
import { useGroups } from '@/modules/groups/api/groups.queries'
import { useStudent } from '../api/students.queries'
import { studentFormSchema, type StudentFormValues } from '../schema/student.schema'
import type { CreateStudentInput, UpdateStudentInput } from '../types/student.types'

const statusOptions = [
  { value: 'active', label: 'نشط' },
  { value: 'inactive', label: 'غير نشط' },
]

export default function StudentFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const studentId = Number(id)
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { data: student, isLoading } = useStudent(studentId)
  const createMutation = useCreateStudent()
  const updateMutation = useUpdateStudent(studentId)
  const enrollMutation = useEnrollStudent(studentId)
  const { data: groups = [] } = useGroups()
  const [profileImage, setProfileImage] = useState<File>()
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<StudentFormValues>({
    resolver: zodResolver(studentFormSchema),
    defaultValues: { status: 'active', includeParent: false },
  })
  const status = watch('status')
  const includeParent = watch('includeParent')

  useEffect(() => {
    if (!student) return
    reset({
      fullName: student.fullName,
      phoneNumber: student.phoneNumber || '',
      profilePictureUrl: student.profilePictureUrl || '',
      studentCode: student.studentCode || '',
      status: student.status === 'inactive' ? 'inactive' : 'active',
      password: '',
      parentFullName: student.parent?.fullName || student.parentName || '',
      parentPhone: student.parent?.phoneNumber || student.parentPhone || '',
      parentWhatsapp: student.parent?.whatsappNumber || student.parentWhatsapp || '',
      parentPassword: '',
      includeParent: Boolean(student.parent || student.parentName),
      groupId: student.groupEnrollments?.[0]?.group.id ? String(student.groupEnrollments[0].group.id) : '',
      customPrice: student.groupEnrollments?.[0]?.customPrice == null ? '' : String(student.groupEnrollments[0].customPrice),
    })
  }, [student, reset])

  const onSubmit = async (values: StudentFormValues) => {
    try {
      if (isEdit) {
        const payload: UpdateStudentInput = {
          fullName: values.fullName,
          phoneNumber: values.phoneNumber || null,
          status: values.status,
          studentCode: values.studentCode || null,
          groupId: values.groupId ? Number(values.groupId) : null,
          customPrice: values.customPrice ? Number(values.customPrice) : null,
          ...(values.password ? { password: values.password } : {}),
          profileImage,
        }
        await updateMutation.mutateAsync(payload)
        notify.success('تم تحديث بيانات الطالب')
      } else {
        const payload: CreateStudentInput = {
          fullName: values.fullName,
          phoneNumber: values.phoneNumber || null,
          profileImage,
          status: values.status,
          studentCode: values.studentCode || null,
          groupId: values.groupId ? Number(values.groupId) : null,
          customPrice: values.customPrice ? Number(values.customPrice) : null,
          ...(values.includeParent
            ? {
              parent: {
                fullName: values.parentFullName || '',
                phoneNumber: values.parentPhone || '',
                whatsappNumber: values.parentWhatsapp || null,
                password: values.parentPassword || null,
              },
            }
            : {}),
        }
        await createMutation.mutateAsync(payload)
        notify.success('تم إنشاء الطالب بنجاح')
      }
      if (isEdit && values.groupId) {
        await enrollMutation.mutateAsync({ groupId: Number(values.groupId), customPrice: values.customPrice ? Number(values.customPrice) : null })
      }
      navigate('/students')
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'تعذر حفظ بيانات الطالب')
    }
  }

  const pending = createMutation.isPending || updateMutation.isPending || enrollMutation.isPending
  if (isEdit && isLoading)
    return (
      <div className="flex h-[50vh] items-center justify-center text-[12px] text-text-muted">
        جاري تحميل بيانات الطالب...
      </div>
    )

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="mx-auto flex w-full max-w-5xl flex-col gap-5 pb-10 animate-in fade-in duration-300"
    >
      <Breadcrumb
        items={[
          { label: 'الطلاب', href: '/students' },
          { label: isEdit ? 'تعديل الطالب' : 'إضافة طالب' },
        ]}
      />
      <PageHeader
        title={isEdit ? 'تعديل بيانات الطالب' : 'إضافة طالب جديد'}
        description={
          isEdit
            ? 'حدّث بيانات الطالب الأساسية وحالة حسابه.'
            : 'أدخل بيانات الطالب الأساسية، ويمكنك إضافة ولي الأمر اختيارياً.'
        }
        actions={
          <Button
            type="submit"
            color="primary"
            style="solid"
            size="sm"
            uppercase={false}
            leftIcon={<Save size={15} />}
            loading={pending}
          >
            حفظ البيانات
          </Button>
        }
      />
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1fr)_300px]">
        <div className="flex flex-col gap-4">
          <FormSection
            icon={<UserRound size={16} />}
            title="بيانات الطالب"
            description="المعلومات الأساسية التي ستظهر في ملف الطالب."
          >
            <div className="mb-4"><ImageUpload value={student?.profilePictureUrl || ''} onChange={(value) => setValue('profilePictureUrl', value, { shouldValidate: true })} onFileChange={setProfileImage} label="الصورة الشخصية للطالب" description="يفضل أن تكون مربعة الشكل بصيغة PNG أو JPG وبحجم لا يتجاوز 5 ميجابايت." /></div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input
                label="الاسم الكامل"
                placeholder="مثال: أحمد محمد"
                leadingIcon={<UserRound size={14} />}
                variant="outline"
                {...register('fullName')}
                error={errors.fullName?.message}
              />
              <Input
                label="رقم الهاتف"
                placeholder="0123456789"
                leadingIcon={<Phone size={14} />}
                variant="outline"
                dir="ltr"
                {...register('phoneNumber')}
                error={errors.phoneNumber?.message}
              />
              <Input
                label="رمز الطالب"
                placeholder="يُنشأ تلقائياً إذا تركته فارغاً"
                leadingIcon={<IdCard size={14} />}
                variant="outline"
                dir="ltr"
                {...register('studentCode')}
                error={errors.studentCode?.message}
              />
              {isEdit && (
                <Input
                  label="كلمة مرور جديدة"
                  placeholder="اتركها فارغة دون تغيير"
                  leadingIcon={<KeyRound size={14} />}
                  type="password"
                  variant="outline"
                  dir="ltr"
                  {...register('password')}
                  error={errors.password?.message}
                />
              )}
            </div>
            <div className="mt-4">
              <Checkbox
                checked={includeParent}
                onChange={(checked) =>
                  setValue('includeParent', checked, { shouldValidate: true })
                }
                label="إضافة ولي أمر"
              />
            </div>
            <div className="mt-5 grid gap-4 border-t border-border-subtle pt-5 sm:grid-cols-2">
              <Select
                label="المجموعة الدراسية (اختياري)"
                value={watch('groupId') || ''}
                onChange={(value) => setValue('groupId', value, { shouldDirty: true })}
                options={[{ value: '', label: 'بدون مجموعة' }, ...groups.map((group) => ({ value: String(group.id), label: `${group.groupName}${group.studyStage?.stageName ? ` · ${group.studyStage.stageName}` : ''}` }))]}
                size="lg"
              />
              <Input
                label="السعر الخاص بالمجموعة"
                type="number"
                placeholder="اختياري"
                leadingIcon={<span className="text-[11px]">ج.م</span>}
                variant="outline"
                size="lg"
                {...register('customPrice')}
              />
            </div>
            {includeParent && (
              <div className="mt-4 animate-in slide-in-from-top-2 fade-in duration-300">
                <FormSection
                  className='p-0!'
                  icon={<UsersRound size={16} />}
                  title="بيانات ولي الأمر"
                  description={
                    isEdit
                      ? 'بيانات ولي الأمر الحالية. تغييرها متاح من ملف ولي الأمر.'
                      : 'سيتم إنشاء حساب ولي الأمر تلقائياً عند الحفظ.'
                  }
                >
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Input
                      label="اسم ولي الأمر"
                      placeholder="مثال: محمد أحمد"
                      leadingIcon={<UserRound size={14} />}
                      variant="outline"
                      disabled={isEdit}
                      {...register('parentFullName')}
                      error={errors.parentFullName?.message}
                    />
                    <Input
                      label="هاتف ولي الأمر"
                      placeholder="01xxxxxxxxx"
                      leadingIcon={<Phone size={14} />}
                      variant="outline"
                      dir="ltr"
                      disabled={isEdit}
                      {...register('parentPhone')}
                      error={errors.parentPhone?.message}
                    />
                    <Input
                      label="واتساب ولي الأمر"
                      placeholder="01xxxxxxxxx"
                      leadingIcon={<Phone size={14} />}
                      variant="outline"
                      dir="ltr"
                      disabled={isEdit}
                      {...register('parentWhatsapp')}
                      error={errors.parentWhatsapp?.message}
                    />
                    {!isEdit && (
                      <Input
                        label="كلمة مرور ولي الأمر"
                        placeholder="اختياري"
                        leadingIcon={<KeyRound size={14} />}
                        type="password"
                        variant="outline"
                        dir="ltr"
                        {...register('parentPassword')}
                        error={errors.parentPassword?.message}
                      />
                    )}
                  </div>
                </FormSection>
              </div>
            )}
          </FormSection>
        </div>
        <aside className="flex flex-col gap-4">
          <FormSection icon={<IdCard size={16} />} title="حالة الحساب">
            <Select
              value={status}
              onChange={(value) =>
                setValue('status', value as StudentFormValues['status'], { shouldValidate: true })
              }
              options={statusOptions}
              label="الحالة"
            />
          </FormSection>
          <div className="bg-info-subtle p-2 text-[11px] leading-relaxed text-info-subtle-foreground">
            <p className="font-bold text-info">ملاحظة مهمة</p>
            <p className="mt-1">
              سيتم إنشاء كلمة مرور عشوائية من 8 أحرف ورموز للطالب تلقائياً عند الحفظ.
            </p>
          </div>
        </aside>
      </div>
    </form>
  )
}

function FormSection({
  icon,
  title,
  description,
  children,
  className
}: {
  icon: React.ReactNode
  title: string
  description?: string
  children?: React.ReactNode,
  className?: string
}) {
  return (
    <Card className={`${className || ''}`}>
      <header className="mb-4 flex items-start gap-2">
        <span className="flex h-7 w-7 items-center justify-center bg-primary/10 text-primary">
          {icon}
        </span>
        <div>
          <h2 className="text-[13px] font-bold text-text">{title}</h2>
          {description && <p className="mt-0.5 text-[11px] text-text-muted">{description}</p>}
        </div>
      </header>
      {children}
    </Card>
  )
}
