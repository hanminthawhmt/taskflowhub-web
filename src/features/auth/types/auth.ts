export interface User {
  id: string
  name: string
  email: string
  platformRole?: 'user' | 'super_admin'
}

export interface Company {
  id: string
  name: string
  planId?: string
  tier?: 'free' | 'starter' | 'pro' | 'enterprise'
}

export interface AuthResponse {
  message: string
  user: User
  token: string
  company?: Company
}

export interface LoginRequest {
  email: string
  password: string
}

export interface RegisterRequest {
  name: string
  email: string
  password: string
  companyName: string
}
