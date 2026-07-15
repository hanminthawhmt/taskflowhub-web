import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router'
import { useAuthStore } from '../store/useAuthStore'
import { useUiStore } from '../store/useUiStore'
import {
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  CreditCard,
  Settings,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Sun,
  Moon,
  LogOut,
  Building,
  User,
  ChevronDown
} from 'lucide-react'

export default function DashboardLayout() {
  const { user, activeCompany, clearAuth, setActiveCompany } = useAuthStore()
  const { sidebarOpen, theme, toggleSidebar, toggleTheme } = useUiStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [companyDropdownOpen, setCompanyDropdownOpen] = useState(false)
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)

  const navigate = useNavigate()
  const location = useLocation()

  // Generate a mock list of companies based on user context
  const companiesList = user
    ? [
        { id: user.id + '-comp', name: activeCompany?.name || 'Default Company' },
        { id: 'mock-comp-2', name: 'Personal Workspace' }
      ]
    : []


  // Sync theme with document class on mount
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')
    root.classList.add(theme)
  }, [theme])

  const handleLogout = () => {
    clearAuth()
    navigate('/login', { replace: true })
  }

  const handleCompanyChange = (company: { id: string; name: string }) => {
    setActiveCompany({ id: company.id, name: company.name })
    setCompanyDropdownOpen(false)
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Projects', path: '/dashboard/projects', icon: FolderKanban },
    { name: 'My Tasks', path: '/dashboard/tasks', icon: CheckSquare },
    { name: 'Billing', path: '/dashboard/billing', icon: CreditCard },
    { name: 'Settings', path: '/dashboard/settings', icon: Settings },
  ]

  // Get active page name for breadcrumb
  const currentNavItem = navItems.find(item => location.pathname.startsWith(item.path))
  const pageTitle = currentNavItem ? currentNavItem.name : 'TaskSaaS'

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300 font-sans">

      {/* 1. Desktop Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ${
          sidebarOpen ? 'w-64' : 'w-20'
        }`}
      >
        {/* Brand / Logo */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="h-9 w-9 min-w-[36px] rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/10">
              T
            </div>
            {sidebarOpen && (
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TaskSaaS
              </span>
            )}
          </div>

          <button
            onClick={toggleSidebar}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {sidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
          </button>
        </div>

        {/* Company Switcher */}
        {user && (
          <div className="p-3 border-b border-slate-200 dark:border-slate-800 relative">
            <button
              onClick={() => sidebarOpen && setCompanyDropdownOpen(!companyDropdownOpen)}
              disabled={!sidebarOpen}
              className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors border border-transparent ${
                sidebarOpen
                  ? 'hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-700 cursor-pointer'
                  : 'bg-transparent justify-center'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <Building size={18} className="text-slate-500 dark:text-slate-400 min-w-[18px]" />
                {sidebarOpen && (
                  <span className="font-semibold text-sm truncate">
                    {activeCompany?.name || 'Default Workspace'}
                  </span>
                )}
              </div>
              {sidebarOpen && <ChevronDown size={14} className="text-slate-500" />}
            </button>

            {/* Switcher Dropdown */}
            {companyDropdownOpen && sidebarOpen && (
              <div className="absolute left-3 right-3 mt-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 py-1 overflow-hidden">
                <div className="px-3 py-1.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  Workspaces
                </div>
                {companiesList.map(comp => (
                  <button
                    key={comp.id}
                    onClick={() => handleCompanyChange(comp)}
                    className={`w-full flex items-center justify-between px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 text-left ${
                      activeCompany?.id === comp.id ? 'font-semibold text-blue-600 dark:text-blue-400' : ''
                    }`}
                  >
                    {comp.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Navigation Menu */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => {
                  setCompanyDropdownOpen(false)
                  setUserDropdownOpen(false)
                }}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-slate-100 border border-transparent'
                  }`
                }
              >
                <Icon size={18} />
                {sidebarOpen && <span>{item.name}</span>}
              </NavLink>
            )
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-slate-950 dark:hover:text-slate-100 cursor-pointer`}
          >
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            {sidebarOpen && <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>}
          </button>

          <button
            onClick={handleLogout}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 cursor-pointer`}
          >
            <LogOut size={18} />
            {sidebarOpen && <span>Sign Out</span>}
          </button>
        </div>
      </aside>

      {/* 2. Mobile Sidebar Drawer Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/40 backdrop-blur-sm">
          <div className="w-64 bg-white dark:bg-slate-900 flex flex-col h-full shadow-xl">
            <div className="h-16 flex items-center justify-between px-4 border-b border-slate-200 dark:border-slate-800">
              <span className="font-bold text-lg text-blue-600 dark:text-blue-400">TaskSaaS</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X size={20} />
              </button>
            </div>

            {user && (
              <div className="p-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2 px-2 py-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                  <Building size={16} className="text-slate-500" />
                  <span className="font-semibold text-sm truncate">{activeCompany?.name}</span>
                </div>
              </div>
            )}

            <nav className="flex-1 px-3 py-4 space-y-1.5">
              {navItems.map(item => {
                const Icon = item.icon
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/50'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                      }`
                    }
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </NavLink>
                )
              })}
            </nav>

            <div className="p-3 border-t border-slate-200 dark:border-slate-800 space-y-1">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
              </button>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20"
              >
                <LogOut size={18} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 3. Main Workspace Container */}
      <div className="flex flex-col flex-1 overflow-hidden">

        {/* Navbar */}
        <header className="h-16 flex items-center justify-between px-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">

          {/* Left section: Breadcrumb & Toggles */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-1 rounded-md text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden cursor-pointer"
            >
              <Menu size={20} />
            </button>

            <h1 className="text-lg font-bold md:text-xl text-slate-900 dark:text-white tracking-tight">
              {pageTitle}
            </h1>
          </div>

          {/* Right section: Profile Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <div className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400 font-bold uppercase shadow-sm">
                  {user.name.charAt(0)}
                </div>
                <div className="hidden sm:block text-left">
                  <div className="text-xs font-semibold truncate max-w-[120px]">{user.name}</div>
                  <div className="text-[10px] text-slate-500 truncate max-w-[120px]">{user.email}</div>
                </div>
                <ChevronDown size={14} className="text-slate-500" />
              </button>

              {/* User Settings Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-lg z-50 py-1.5 overflow-hidden">
                  <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                    <div className="font-bold text-slate-800 dark:text-slate-200">{user.name}</div>
                    <div>{user.email}</div>
                    {user.platformRole === 'super_admin' && (
                      <span className="mt-1 inline-block px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/50 rounded">
                        Super Admin
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => { navigate('/dashboard/settings'); setUserDropdownOpen(false) }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                  >
                    <User size={14} />
                    <span>My Profile</span>
                  </button>
                  <button
                    onClick={() => { navigate('/dashboard/settings'); setUserDropdownOpen(false) }}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-left"
                  >
                    <Settings size={14} />
                    <span>Settings</span>
                  </button>

                  <div className="border-t border-slate-200 dark:border-slate-800 my-1"></div>

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/20 text-left"
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </header>

        {/* Scrollable Dashboard View */}
        <main className="flex-1 overflow-y-auto bg-slate-50 dark:bg-slate-950 transition-colors duration-300">
          <Outlet />
        </main>
      </div>

    </div>
  )
}
