import { apiClient } from '../../../api/client'
import type { AuthResponse, LoginRequest, RegisterRequest, Company, User } from '../types/auth'

export const authService = {
  getMe: async (): Promise<User> => {
    const response = await apiClient.get<{ data: User }>('/users/me')
    return response.data.data
  },

  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/login', data)
    return response.data
  },

  register: async (data: RegisterRequest): Promise<AuthResponse> => {
    const response = await apiClient.post<AuthResponse>('/auth/register', data)
    return response.data
  },

  updateProfile: async (data: { name?: string; email?: string }): Promise<{ message: string; data: { id: number; name: string; email: string } }> => {
    const response = await apiClient.patch<{ message: string; data: { id: number; name: string; email: string } }>('/users/me', data)
    return response.data
  },

  updatePassword: async (data: unknown): Promise<{ message: string }> => {
    const response = await apiClient.put<{ message: string }>('/users/me/password', data)
    return response.data
  },

  getCompanies: async (): Promise<Company[]> => {
    const response = await apiClient.get<{ data: Company[] }>('/companies')
    return response.data.data
  },

  getCompanyById: async (companyId: number | string): Promise<Company> => {
    const response = await apiClient.get<{ data: Company }>(`/companies/${companyId}`)
    return response.data.data
  },

  updateCompany: async (companyId: number | string, name: string): Promise<{ message: string; data: Company }> => {
    const response = await apiClient.patch<{ message: string; data: Company }>(`/companies/${companyId}`, { name })
    return response.data
  },
}
