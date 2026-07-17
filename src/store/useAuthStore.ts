import { create } from 'zustand'
import type { User, Company } from '../features/auth/types/auth'

interface AuthState {
  user: User | null
  token: string | null
  activeCompany: Company | null
  isAuthenticated: boolean
  setAuth: (user: User, token: string, company?: Company) => void
  setUser: (user: User) => void
  clearAuth: () => void
  setActiveCompany: (company: Company) => void
}

const getInitialUser = (): User | null => {
  try {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  } catch {
    return null
  }
}

const getInitialCompany = (): Company | null => {
  try {
    const compStr = localStorage.getItem('activeCompany')
    return compStr ? JSON.parse(compStr) : null
  } catch {
    return null
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  token: localStorage.getItem('token'),
  activeCompany: getInitialCompany(),
  isAuthenticated: !!localStorage.getItem('token'),
  setAuth: (user, token, company) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    if (company) {
      localStorage.setItem('activeCompany', JSON.stringify(company))
    }
    set({
      user,
      token,
      activeCompany: company || null,
      isAuthenticated: true,
    })
  },
  clearAuth: () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('activeCompany')
    set({
      user: null,
      token: null,
      activeCompany: null,
      isAuthenticated: false,
    })
  },
  setActiveCompany: (company) => {
    localStorage.setItem('activeCompany', JSON.stringify(company))
    set({ activeCompany: company })
  },
  setUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user))
    set({ user })
  },
}))
