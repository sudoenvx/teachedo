import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import { GraduationCap, School, Settings } from 'lucide-react'
import { LayoutShell, QuickActions as QuickActionsPanel } from '@teachedo/ui'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'

function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setMobileMenuOpen(false), [location.pathname])
  const navigate = useNavigate()
  return <LayoutShell sidebar={<Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />} navbar={<Navbar onMobileMenuClick={() => setMobileMenuOpen(true)} />}><div className="mx-auto h-full max-w-6xl"><Outlet /><QuickActionsPanel columns={2} actions={[{ id: 'add-teacher', label: 'إضافة مدرس', icon: <School size={16} />, onClick: () => navigate('/teachers/new') }, { id: 'teachers', label: 'المدرسون', icon: <GraduationCap size={16} />, onClick: () => navigate('/teachers') }, { id: 'settings', label: 'الإعدادات', icon: <Settings size={16} />, onClick: () => navigate('/settings') }]} /></div></LayoutShell>
}

export default MainLayout