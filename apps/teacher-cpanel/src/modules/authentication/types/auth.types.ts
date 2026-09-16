export interface TeacherUser {
  id: number
  fullName: string
  username: string
  email?: string | null
  accountStatus: string
  onboardingRequired?: boolean
}

export interface TeacherLoginResponse {
  teacher: TeacherUser
  token: string
}

export interface AssistantUser {
  id: number
  fullName: string
  username: string
  email?: string | null
  teacherId: number
  permissions: string[]
}

export interface AssistantLoginResponse {
  assistant: AssistantUser
  token: string
}