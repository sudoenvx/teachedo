import { useNavigate } from 'react-router-dom'
import {
  LayoutNavbar,
  type NotificationItemProps,
} from '@teachedo/ui'
import { useTeacherLogout } from '@/modules/authentication/api/auth.mutations'

type NavbarProps = { onMobileMenuClick: () => void }
const notifications: NotificationItemProps[] = [
  {
    variant: 'info',
    title: 'تذكير بالجدول',
    description: 'لديك حصة قادمة في جدول اليوم.',
    timestamp: 'منذ 10 دقائق',
    read: false,
  },
  {
    variant: 'success',
    title: 'تحديث الطلاب',
    description: 'تم تحديث بيانات مجموعة الفيزياء.',
    timestamp: 'منذ ساعتين',
  },
]

export function Navbar({ onMobileMenuClick }: NavbarProps) {
  const navigate = useNavigate()
  const logoutMutation = useTeacherLogout()
  const logout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } finally {
      navigate('/login', { replace: true })
    }
  }

  return (
    <LayoutNavbar
      onMobileMenuClick={onMobileMenuClick}
      title="Teacher Base Cpanel"
      notifications={notifications}
      onLogout={logout}
    />
  )
}
