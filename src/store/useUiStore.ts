import { create } from 'zustand'

interface UiState {
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleTheme: () => void
  setTheme: (theme: 'light' | 'dark') => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarOpen: true,
  theme: (localStorage.getItem('theme') as 'light' | 'dark') || 'light',
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleTheme: () => set((state) => {
    const nextTheme = state.theme === 'light' ? 'dark' : 'light'
    localStorage.setItem('theme', nextTheme)

    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(nextTheme)

    return { theme: nextTheme }
  }),
  setTheme: (theme) => set(() => {
    localStorage.setItem('theme', theme)

    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)

    return { theme }
  }),
}))
