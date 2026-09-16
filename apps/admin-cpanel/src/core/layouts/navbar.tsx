import { useNavigate } from 'react-router-dom'
import { LayoutNavbar, type NotificationItemProps } from '@teachedo/ui'
import { useAdminLogout } from '@/modules/auth/api/auth.mutations'
import Cookies from 'js-cookie'

type NavbarProps = { onMobileMenuClick: () => void }
const notifications: NotificationItemProps[] = []

export function Navbar({ onMobileMenuClick }: NavbarProps) {
  const navigate = useNavigate()
  const logoutMutation = useAdminLogout()
  const logout = async () => {
    try {
      await logoutMutation.mutateAsync()
    } finally {
      Cookies.remove('access_token')
      localStorage.removeItem('access_token')
      navigate('/login', { replace: true })
    }
  }
  return (
    <LayoutNavbar
      onMobileMenuClick={onMobileMenuClick}
      title="لوحة إدارة EDU-HUB"
      notifications={notifications}
      onLogout={logout}
    />
  )
}
