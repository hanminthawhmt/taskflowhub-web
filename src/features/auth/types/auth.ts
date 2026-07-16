export interface User {
  id: number
  name: string
  email: string
  platformRole?: 'user' | 'super_admin'
}

export interface Company {
  id: number
  name: string
  planId?: number
  planName?: string
  subscriptionStatus?: string
  role?: string
  roleId?: number
  tier?: 'free' | 'starter' | 'pro' | 'enterprise'
  createdAt?: string
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
