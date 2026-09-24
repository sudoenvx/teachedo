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
import ChangePasswordPage from '@/modules/authentication/pages/change-password-page'
import WelcomePage from '@/modules/authentication/pages/welcome-page'
import ProtectedLayout from '../core/layouts/protected_layout'
import AssistantsPage from '@/modules/assistants/pages/assistants-page'
import AssistantEditPage from '@/modules/assistants/pages/assistant-edit-page'
import CentersPage from '@/modules/centers/pages/centers-page'
import CenterFormPage from '@/modules/centers/pages/center-form-page'
import CenterProfilePage from '@/modules/centers/pages/center-profile-page'
import SchedulesPage from '@/modules/schedules/pages/schedules-page'
import LiveDeskPage from '@/modules/sessions/pages/live-desk-page'


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
    path: 'password/change',
    element: <ChangePasswordPage />,
  },
  {
    path: 'welcome',
    element: <WelcomePage />,
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
      { path: 'centers', element: <CentersPage /> },
      { path: 'centers/new', element: <CenterFormPage /> },
      { path: 'centers/:id', element: <CenterProfilePage /> },
      { path: 'centers/:id/edit', element: <CenterFormPage /> },
      { path: 'assistants', element: <AssistantsPage /> },
      { path: 'assistants/:id/edit', element: <AssistantEditPage /> },
      { path: 'schedules', element: <SchedulesPage /> },
      { path: 'classes/:classId/sessions/:sessionId/live', element: <LiveDeskPage /> },
      ] },
    ],
  },
])

export default router
