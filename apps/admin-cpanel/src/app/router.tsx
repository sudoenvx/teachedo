import { createBrowserRouter } from 'react-router-dom'
import Dashboard from '../modules/dashboard/pages/dashboard'
import MainLayout from '../core/layouts/main_layout'
import LoginPage from '@/modules/auth/pages/login-page'
import TeachersPage from '@/modules/teacher/pages/teachers-page'
import TeacherManagePage from '@/modules/teacher/pages/teacher-manage-page'
import SettingsPage from '@/modules/settings/pages/settings-page'
import CreateTeacherPage from '@/modules/teacher/pages/create-teacher-page'
import { ProtectedLayout } from '../core/layouts/protected_layout'


const router = createBrowserRouter([
  {
    path: 'login',
    element: <LoginPage />,
  },
  {
    // element: <ProtectedLayout><MainLayout /></ProtectedLayout>,
    element: <MainLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: '/teachers',
        element: <TeachersPage />
      },
      {
        path: '/teachers/new',
        element: <CreateTeacherPage />
      },
      {
        path: '/teachers/:id',
        element: <TeacherManagePage />
      },
      {
        path: '/settings',
        element: <SettingsPage />
      },
    ],
  },
])

export default router
