import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useTeacherMe } from '@/modules/authentication/api/auth.queries'
import { useAssistantMe } from '@/modules/authentication/api/assistant.queries'

export default function ProtectedLayout() {
  const location = useLocation()
  const { data: teacher, isLoading, isError } = useTeacherMe()
  const assistantMode = localStorage.getItem('teacher-cpanel-role') === 'assistant'
  const { data: assistant, isLoading: assistantLoading, isError: assistantError } = useAssistantMe()

  if (isLoading || assistantLoading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas text-[12px] text-text-muted">
        جاري التحقق من الحساب...
      </div>
    )
  if (assistantMode) {
    if (assistantError || !assistant)
      return (
        <Navigate
          to={`/login?mode=assistant&redirect=${encodeURIComponent(location.pathname)}`}
          replace
        />
      )
    return <Outlet />
  }
  if (isError || !teacher)
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />
  if (teacher.onboardingRequired) return <Navigate to="/onboarding" replace />
  return <Outlet />
}
