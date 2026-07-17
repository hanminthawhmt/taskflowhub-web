import { useMutation, useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router'
import { authService } from '../services/auth.service'
import { useAuthStore } from '../../../store/useAuthStore'
import type { LoginRequest, RegisterRequest, Company } from '../types/auth'

export function useCompaniesQuery() {
  return useQuery({
    queryKey: ['auth', 'companies'],
    queryFn: () => authService.getCompanies(),
  })
}

export function useProfileQuery(enabled = true) {
  return useQuery({
    queryKey: ['auth', 'me'],
    queryFn: () => authService.getMe(),
    enabled,
  })
}

interface NestedUserResponse {
  id: string
  name: string
  email: string
  company?: Company
  companies?: Company[]
  companyId?: string
  companyName?: string
}

export function useAuth() {
  const navigate = useNavigate()
  const setAuth = useAuthStore((state) => state.setAuth)
  const clearAuth = useAuthStore((state) => state.clearAuth)
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const activeCompany = useAuthStore((state) => state.activeCompany)

  const loginMutation = useMutation({
    mutationFn: (data: LoginRequest) => authService.login(data),
    onSuccess: (data) => {
      let activeCompany = data?.company
      const userWithCompany = data?.user as unknown as NestedUserResponse | undefined

      if (userWithCompany) {
        if (!activeCompany && userWithCompany.company) {
          activeCompany = userWithCompany.company
        } else if (!activeCompany && Array.isArray(userWithCompany.companies) && userWithCompany.companies.length > 0) {
          activeCompany = userWithCompany.companies[0]
        } else if (!activeCompany && userWithCompany.companyId) {
          activeCompany = {
            id: Number(userWithCompany.companyId),
            name: userWithCompany.companyName || 'My Company',
          }
        }
      }

      const finalUser = data?.user || { id: 0, name: 'User', email: '' }
      const finalToken = data?.token || ''

      setAuth(finalUser, finalToken, activeCompany)
      navigate('/dashboard', { replace: true })
    },
  })

  const registerMutation = useMutation({
    mutationFn: (data: RegisterRequest) => authService.register(data),
    onSuccess: (data) => {
      setAuth(data.user, data.token, data.company)
      navigate('/dashboard', { replace: true })
    },
  })

  const logout = () => {
    clearAuth()
    navigate('/login', { replace: true })
  }

  return {
    user,
    isAuthenticated,
    activeCompany,
    login: loginMutation.mutateAsync,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    register: registerMutation.mutateAsync,
    isRegistering: registerMutation.isPending,
    registerError: registerMutation.error,
    logout,
  }
}
