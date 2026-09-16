export interface AdminUser {
  id: string
  name: string
  email: string
  role: 'SUPER_ADMIN'
}

export interface LoginResponse {
  access_token: string
  admin: AdminUser
}