import { useMemo, useState } from 'react'
import { DataTable, DropdownMenu, DropdownMenuItem, IconButton, Pagination } from '@teachedo/ui/legacy'
// import { useDeleteTeacher } from '../../api/teachers.mutations'
// import { useNotification } from '@/core/hooks/use_notification'
import { useTeachersList, type TeacherListItem } from '@/modules/teacher/api/teachers.queries'
import { Edit, MoreVertical, CreditCard, Ban, Trash } from 'lucide-react'

interface Props {
  searchQuery: string
}

export function TeachersTable({ searchQuery }: Props) {
  const [page, setPage] = useState(1)

  const { data: result, isLoading } = useTeachersList(page, searchQuery)
  // const deleteMutation = useDeleteTeacher()
  // const { notify } = useNotification()

  // const handleDelete = async (id: string) => {
  //   if (confirm('هل أنت متأكد من حذف هذا المدرس؟')) {
  //     try {
  //       await deleteMutation.mutateAsync({ id })
  //       notify.success('تم حذف المدرس بنجاح')
  //     } catch (error: any) {
  //       notify.error('فشل في الحذف')
  //     }
  //   }
  // }

  const columns = useMemo(
    () => [
      {
        header: 'المدرس',
        accessor: 'name' as keyof TeacherListItem,
        render: (item: TeacherListItem) => (
          <div className="flex flex-col">
            <span className="font-semibold text-text text-[12px]">{item.fullName}</span>
            <span className="text-[11px] text-text-muted">{item.phoneNumber}</span>
          </div>
        ),
      },
      {
        header: 'المادة',
        accessor: 'subject' as keyof TeacherListItem,
        render: (item: TeacherListItem) => (
          <span className="text-[12px] text-text-muted font-medium">{item.subjectSpecialization}</span>
        ),
      },
      {
        header: 'إجمالي الطلاب',
        accessor: 'studentsCount' as keyof TeacherListItem,
        render: (item: TeacherListItem) => (
          <span className="text-[12px] font-semibold text-text tabular-nums">
            {item.studentsCount}
          </span>
        ),
      },

      {
        header: 'تاريخ الانضمام',
        accessor: 'joinDate' as keyof TeacherListItem,
        render: (item: TeacherListItem) => (
          <span className="text-[12px] text-text-muted">{item.createdAt}</span>
        ),
      },
      {
        header: '',
        render: () => (
          <div className="flex items-center gap-1">
            <IconButton aria-label="عرض التفاصيل" icon={<Edit />} style="ghost" size="sm" title="عرض التفاصيل" />
            <DropdownMenu
              align="end"
              trigger={<IconButton aria-label="الإجراءات" icon={<MoreVertical />} style="ghost" size="sm" />}
            >
              {/* <DropdownMenuItem icon={<Pencil />} onSelect={() => setEditingTeacher(item)}>
                تعديل البيانات
              </DropdownMenuItem> */}
              <DropdownMenuItem icon={<CreditCard />}>سجل الفواتير</DropdownMenuItem>
              <DropdownMenuItem variant="danger" icon={<Ban />}>
                إيقاف مؤقت
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="danger"
                icon={<Trash />}
              // onSelect={() => handleDelete(item.id)}
              >
                حذف نهائي
              </DropdownMenuItem>
            </DropdownMenu>
          </div>
        )
      }
    ],
    []
  )

  return (
    <>
      <DataTable
        dir="rtl"
        data={result?.data || []}
        columns={columns}
        getRowId={(item) => item.id.toString()}
        loading={isLoading}
        persistedKey="teachers-main-table"
        title="قائمة المدرسين"
        description="عرض جميع المدرسين في النظام مع إمكانية البحث والتصفح."

        pagination={
          <Pagination
            currentPage={result?.meta.current_page || 1}
            totalPages={result?.meta.total || 1}
            onPageChange={setPage}
            totalItems={result?.meta.total || 0}
            perPage={result?.meta.per_page || 10}
          />
        }

      />
    </>
  )
}
