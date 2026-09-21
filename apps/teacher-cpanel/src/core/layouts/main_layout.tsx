import { Outlet } from 'react-router-dom'
import { Layout, LayoutContent, LayoutInset } from '@teachedo/ui'
import { Navbar } from './navbar'
import { Sidebar } from './sidebar'

function MainLayout() {
  return <Layout dir="rtl" tenantId="teacher-cpanel" storagePrefix="teacher-layout:v1"><Sidebar /><LayoutInset><Navbar /><LayoutContent><Outlet /></LayoutContent></LayoutInset></Layout>
}

export default MainLayout
