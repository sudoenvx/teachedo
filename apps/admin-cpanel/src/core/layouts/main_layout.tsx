import { useState } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { GraduationCap, School, Settings } from 'lucide-react'
import { LayoutShell, QuickActions as QuickActionsPanel } from '@teachedo/ui/legacy'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'

function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const navigate = useNavigate()
  return <LayoutShell sidebar={<Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />} navbar={<Navbar onMobileMenuClick={() => setMobileMenuOpen(true)} />}><div className="mx-auto h-full max-w-6xl"><Outlet /></div></LayoutShell>
}

export default MainLayout