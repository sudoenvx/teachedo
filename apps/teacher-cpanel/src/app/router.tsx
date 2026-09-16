import { createBrowserRouter } from 'react-router-dom'
import MainLayout from '../core/layouts/main_layout'
import LoginPage from '@/modules/authentication/pages/login-page'
import TeacherDashboardPage from '@/modules/dashboard/pages/dashboard-page'
import StudentsPage from '@/modules/students/pages/students-page'
import StudentFormPage from '@/modules/students/pages/student-form-page'
import StudentProfilePage from '@/modules/students/pages/student-profile-page'
import GroupsPage from '@/modules/groups/pages/groups-page'
import GroupFormPage from '@/modules/groups/pages/group-form-page'
import GroupManagementPage from '@/modules/groups/pages/group-management-page'
import TeacherOnboardingPage from '@/modules/authentication/pages/teacher-onboarding-page'
import OnboardingCompletePage from '@/modules/authentication/pages/onboarding-complete-page'
import ProtectedLayout from '../core/layouts/protected_layout'
import AssistantsPage from '@/modules/assistants/pages/assistants-page'
import AssistantEditPage from '@/modules/assistants/pages/assistant-edit-page'


const router = createBrowserRouter([
  {
    path: 'login',
    element: <LoginPage />,
  },
  {
    path: 'onboarding',
    element: <TeacherOnboardingPage />,
  },
  {
    path: 'onboarding/complete',
    element: <OnboardingCompletePage />,
  },
  {
    element: <ProtectedLayout />,
    children: [
      { element: <MainLayout />, children: [
        { index: true, element: <TeacherDashboardPage /> },
      { path: 'dashboard', element: <TeacherDashboardPage /> },
      { path: 'students', element: <StudentsPage /> },
      { path: 'students/:id', element: <StudentProfilePage /> },
      { path: 'students/new', element: <StudentFormPage /> },
      { path: 'students/:id/edit', element: <StudentFormPage /> },
      { path: 'groups', element: <GroupsPage /> },
      { path: 'groups/new', element: <GroupFormPage /> },
      { path: 'groups/:id', element: <GroupManagementPage /> },
      { path: 'groups/:id/edit', element: <GroupFormPage /> },
      { path: 'assistants', element: <AssistantsPage /> },
      { path: 'assistants/:id/edit', element: <AssistantEditPage /> },
      ] },
    ],
  },
])

export default router
