import { useEffect } from 'react'
import { useForm, useFieldArray } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ArrowRight, Plus, Save, Trash2, Users } from 'lucide-react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Breadcrumb, Button, Card, Input, PageHeader, Select, TimeRangePicker } from '@teachedo/ui'
import { useNotification } from '@/core/hooks/use_notification'
import { useTeacherMe } from '@/modules/authentication/api/auth.queries'
import { useCreateGroup, useUpdateGroup } from '../api/groups.mutations'
import { useGroup } from '../api/groups.queries'
import { groupFormSchema, type GroupFormValues } from '../schema/group.schema'
import type { GroupInput } from '../types/group.types'

const DAYS = [
  { value: 'saturday', label: 'السبت' },
  { value: 'sunday', label: 'الأحد' },
  { value: 'monday', label: 'الاثنين' },
  { value: 'tuesday', label: 'الثلاثاء' },
  { value: 'wednesday', label: 'الأربعاء' },
  { value: 'thursday', label: 'الخميس' },
  { value: 'friday', label: 'الجمعة' },
]
const emptySchedule = { dayOfWeek: 'sunday', startTime: '16:00', endTime: '17:00' }
function timeValue(value?: string) {
  return value ? (value.includes('T') ? value.slice(11, 16) : value.slice(0, 5)) : ''
}

// function emptySchedule() {
//   return { dayOfWeek: 'sunday', startTime: '16:00', endTime: '17:00' }
// }

export default function GroupFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEdit = Boolean(id)
  const groupId = Number(id)
  const navigate = useNavigate()
  const { notify } = useNotification()
  const { data: teacher } = useTeacherMe()
  const { data: group, isLoading } = useGroup(groupId)
  const createMutation = useCreateGroup()
  const updateMutation = useUpdateGroup(groupId)
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<GroupFormValues>({
    resolver: zodResolver(groupFormSchema),
    defaultValues: {
      groupName: '',
      studyStageId: '',
      standardMonthlyFee: '',
      maxCapacity: '',
      schedules: [emptySchedule],
    },
  })
  const { fields, append, remove } = useFieldArray({ control, name: 'schedules' })
  const stageId = watch('studyStageId')

  useEffect(() => {
    if (group)
      reset({
        groupName: group.groupName,
        studyStageId: group.studyStage?.id ? String(group.studyStage.id) : '',
        standardMonthlyFee:
          group.standardMonthlyFee == null ? '' : String(group.standardMonthlyFee),
        maxCapacity: group.maxCapacity == null ? '' : String(group.maxCapacity),
        schedules: group.schedules?.length
          ? group.schedules.map((schedule) => ({
            dayOfWeek: schedule.dayOfWeek,
            startTime: timeValue(schedule.startTime),
            endTime: timeValue(schedule.endTime),
          }))
          : [emptySchedule],
      })
  }, [group, reset])

  const onSubmit = async (values: GroupFormValues) => {
    const payload: GroupInput = {
      groupName: values.groupName,
      studyStageId: values.studyStageId ? Number(values.studyStageId) : null,
      standardMonthlyFee: values.standardMonthlyFee ? Number(values.standardMonthlyFee) : null,
      maxCapacity: values.maxCapacity ? Number(values.maxCapacity) : null,
      schedules: values.schedules,
    }
    try {
      if (isEdit) await updateMutation.mutateAsync(payload)
      else await createMutation.mutateAsync(payload)
      notify.success(isEdit ? 'تم تحديث المجموعة' : 'تم إنشاء المجموعة')
      navigate('/groups')
    } catch (error) {
      notify.error(error instanceof Error ? error.message : 'تعذر حفظ المجموعة')
    }
  }

  if (isEdit && isLoading)
    return (
      <div className="flex h-[50vh] items-center justify-center text-[12px] text-text-muted">
        جاري تحميل المجموعة...
      </div>
    )
  const pending = createMutation.isPending || updateMutation.isPending
  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 pb-10 animate-in fade-in duration-300"
    >
      <Breadcrumb
        items={[
          { label: 'المجموعات', href: '/groups' },
          { label: isEdit ? 'تعديل المجموعة' : 'إضافة مجموعة' },
        ]}
      />
      <PageHeader
        title={isEdit ? 'تعديل المجموعة' : 'إضافة مجموعة جديدة'}
        description="أنشئ المجموعة وحدد المرحلة والرسوم والمواعيد المتكررة."
        actions={
          <div className="flex items-center gap-2">
            <Link to="/groups">
              <Button
                type="button"
                color="secondary"
                style="tint"
                size="sm"
                uppercase={false}
                leftIcon={<ArrowRight size={14} />}
              >
                إلغاء
              </Button>
            </Link>
            <Button
              type="submit"
              color="primary"
              style="solid"
              size="sm"
              uppercase={false}
              leftIcon={<Save size={15} />}
              loading={pending}
            >
              حفظ المجموعة
            </Button>
          </div>
        }
      />
      <Card className="mx-auto w-full max-w-3xl" bodyClassName="p-4 sm:p-6">
        <div className="mb-5 flex items-center gap-3 border-b border-border-subtle pb-4">
          <span className="flex h-9 w-9 items-center justify-center bg-primary-subtle text-primary">
            <Users size={17} />
          </span>
          <div>
            <h2 className="text-[14px] font-bold text-text">بيانات المجموعة</h2>
            <p className="mt-0.5 text-[11px] text-text-muted">
              هذه البيانات تساعدك في تنظيم الطلاب وجدولة الحصص.
            </p>
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="اسم المجموعة"
            placeholder="مثال: مجموعة الرياضيات"
            leadingIcon={<Users size={14} />}
            variant="outline"
            {...register('groupName')}
            error={errors.groupName?.message}
          />
          <Select
            label="المرحلة الدراسية"
            value={stageId || ''}
            onChange={(value) => setValue('studyStageId', value)}
            options={[
              { value: '', label: 'بدون مرحلة' },
              ...(teacher?.studyStages || []).map((stage) => ({
                value: String(stage.id),
                label: stage.stageName,
              })),
            ]}
            variant="outline"
          />
          <Input
            label="الرسوم الشهرية"
            placeholder="مثال: 500"
            type="number"
            leadingIcon={<span className="text-[11px]">ج.م</span>}
            variant="outline"
            {...register('standardMonthlyFee')}
            error={errors.standardMonthlyFee?.message}
          />
          <Input
            label="الحد الأقصى للطلاب"
            placeholder="اختياري"
            type="number"
            variant="outline"
            {...register('maxCapacity')}
          />
        </div>
        <div className="mt-7 border-t border-border-subtle pt-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-[13px] font-bold text-text">مواعيد المجموعة</h3>
              <p className="mt-1 text-[11px] text-text-muted">
                أضف يوماً أو أكثر مع وقت البداية والنهاية لكل موعد.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-col gap-3">
            {fields.map((field, index) => (
              <div
                key={field.id}
                className="grid items-end gap-2 rounded-sm border border-border-subtle bg-canvas p-3 sm:grid-cols-[1fr_1fr_1fr_auto]"
              >
                <Select
                  label="اليوم"
                  value={watch(`schedules.${index}.dayOfWeek`)}
                  onChange={(value) => setValue(`schedules.${index}.dayOfWeek`, value)}
                  options={DAYS}
                />
                <div className="sm:col-span-2">
                  <TimeRangePicker
                    label="الفترة الزمنية"
                    size="lg"
                    value={{ start: watch(`schedules.${index}.startTime`) || null, end: watch(`schedules.${index}.endTime`) || null }}
                    onChange={(value) => {
                      setValue(`schedules.${index}.startTime`, value.start || '')
                      setValue(`schedules.${index}.endTime`, value.end || '')
                    }}
                  />
                </div>
                <Button
                  type="button"
                  color="danger"
                  style="tint"
                  size="sm"
                  aria-label="حذف الموعد"
                  title="حذف الموعد"
                  disabled={fields.length === 1}
                  onClick={() => remove(index)}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            ))}
          </div>
          <Button
            type="button"
            color="primary"
            style="tint"
            size="sm"
            uppercase={false}
            className="mt-3 self-start"
            leftIcon={<Plus size={14} />}
            onClick={() => append(emptySchedule)}
          >
            إضافة موعد
          </Button>
          {errors.schedules?.message && (
            <p className="mt-2 text-[11px] text-danger">{errors.schedules.message}</p>
          )}
        </div>
      </Card>
    </form>
  )
}
