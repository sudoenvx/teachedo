import { useEffect, useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { LayoutShell } from '@teachedo/ui'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'

function MainLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const location = useLocation()
  useEffect(() => setMobileMenuOpen(false), [location.pathname])
  return (
    <LayoutShell
      sidebar={
        <Sidebar mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      }
      navbar={<Navbar onMobileMenuClick={() => setMobileMenuOpen(true)} />}
    >
      <div className="mx-auto h-full max-w-6xl">
        <Outlet />
      </div>
    </LayoutShell>
  )
}

export default MainLayout
