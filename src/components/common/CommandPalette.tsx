import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router'
import {
  Search,
  LayoutDashboard,
  FolderKanban,
  CheckSquare,
  Users,
  CreditCard,
  Settings,
  Sun,
  Moon,
  LogOut,
  UserPlus,
  ArrowRight,
  Sparkles,
} from 'lucide-react'
import { useAuthStore } from '../../store/useAuthStore'
import { useUiStore } from '../../store/useUiStore'
import { useCompanyProjects } from '../../features/projects/hooks/useProjects'

interface CommandPaletteProps {
  isOpen: boolean
  onClose: () => void
}

interface CommandItem {
  id: string
  title: string
  subtitle?: string
  icon: React.ElementType
  category: 'Navigation' | 'Projects' | 'Actions'
  action: () => void
}

export default function CommandPalette({ isOpen, onClose }: CommandPaletteProps) {
  const navigate = useNavigate()
  const activeCompany = useAuthStore((s) => s.activeCompany)
  const clearAuth = useAuthStore((s) => s.clearAuth)
  const { theme, toggleTheme } = useUiStore()

  const companyId = activeCompany?.id || 1
  const { data: projects } = useCompanyProjects(companyId)

  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 50)
    }
  }, [isOpen])

  if (!isOpen) return null

  // Build command list
  const navCommands: CommandItem[] = [
    {
      id: 'nav-dashboard',
      title: 'Go to Dashboard',
      subtitle: 'Overview, stats & recent activity',
      icon: LayoutDashboard,
      category: 'Navigation',
      action: () => {
        navigate('/dashboard')
        onClose()
      },
    },
    {
      id: 'nav-projects',
      title: 'Go to Projects',
      subtitle: 'Manage workspace project boards',
      icon: FolderKanban,
      category: 'Navigation',
      action: () => {
        navigate('/dashboard/projects')
        onClose()
      },
    },
    {
      id: 'nav-tasks',
      title: 'Go to My Tasks',
      subtitle: 'Tasks assigned to you',
      icon: CheckSquare,
      category: 'Navigation',
      action: () => {
        navigate('/dashboard/tasks')
        onClose()
      },
    },
    {
      id: 'nav-members',
      title: 'Go to Members',
      subtitle: 'Workspace team members & invitations',
      icon: Users,
      category: 'Navigation',
      action: () => {
        navigate('/dashboard/members')
        onClose()
      },
    },
    {
      id: 'nav-billing',
      title: 'Go to Billing',
      subtitle: 'Subscriptions & Stripe checkout',
      icon: CreditCard,
      category: 'Navigation',
      action: () => {
        navigate('/dashboard/billing')
        onClose()
      },
    },
    {
      id: 'nav-settings',
      title: 'Go to Settings',
      subtitle: 'Account profile & security',
      icon: Settings,
      category: 'Navigation',
      action: () => {
        navigate('/dashboard/settings')
        onClose()
      },
    },
  ]

  const projectCommands: CommandItem[] = (projects || []).map((p) => ({
    id: `project-${p.id}`,
    title: p.title,
    subtitle: p.description || `Project #${p.id}`,
    icon: FolderKanban,
    category: 'Projects',
    action: () => {
      navigate(`/dashboard/projects/${p.id}`)
      onClose()
    },
  }))

  const actionCommands: CommandItem[] = [
    {
      id: 'action-theme',
      title: theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode',
      subtitle: 'Toggle theme preference',
      icon: theme === 'light' ? Moon : Sun,
      category: 'Actions',
      action: () => {
        toggleTheme()
        onClose()
      },
    },
    {
      id: 'action-invite',
      title: 'Invite Team Member',
      subtitle: 'Send company invitation email',
      icon: UserPlus,
      category: 'Actions',
      action: () => {
        navigate('/dashboard/members')
        onClose()
      },
    },
    {
      id: 'action-logout',
      title: 'Sign Out',
      subtitle: 'End current session',
      icon: LogOut,
      category: 'Actions',
      action: () => {
        clearAuth()
        navigate('/login', { replace: true })
        onClose()
      },
    },
  ]

  const allCommands = [...navCommands, ...projectCommands, ...actionCommands]

  const filteredCommands = allCommands.filter((cmd) => {
    const q = query.toLowerCase()
    return (
      cmd.title.toLowerCase().includes(q) ||
      (cmd.subtitle && cmd.subtitle.toLowerCase().includes(q)) ||
      cmd.category.toLowerCase().includes(q)
    )
  })

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredCommands.length))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev - 1 + filteredCommands.length) % Math.max(1, filteredCommands.length))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (filteredCommands[selectedIndex]) {
        filteredCommands[selectedIndex].action()
      }
    } else if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 md:pt-24 bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[75vh]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search header */}
        <div className="px-4 py-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search size={18} className="text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search projects... (Press Esc to close)"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setSelectedIndex(0)
            }}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-slate-100 dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {filteredCommands.length === 0 ? (
            <div className="py-12 text-center text-sm text-slate-400">
              No matching commands or projects found.
            </div>
          ) : (
            filteredCommands.map((item, index) => {
              const Icon = item.icon
              const isSelected = index === selectedIndex

              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`p-2 rounded-lg shrink-0 ${
                        isSelected
                          ? 'bg-blue-100 dark:bg-blue-900/60 text-blue-600 dark:text-blue-400'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                      }`}
                    >
                      <Icon size={16} />
                    </div>
                    <div className="truncate">
                      <div className="text-sm font-semibold truncate">{item.title}</div>
                      {item.subtitle && (
                        <div className="text-xs text-slate-400 truncate">{item.subtitle}</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 uppercase tracking-wider">
                      {item.category}
                    </span>
                    {isSelected && <ArrowRight size={14} className="text-blue-500" />}
                  </div>
                </button>
              )
            })
          )}
        </div>

        {/* Footer shortcuts helper */}
        <div className="px-4 py-2.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border rounded shadow-xs">↑↓</kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-slate-800 border rounded shadow-xs">↵</kbd>{' '}
              Select
            </span>
          </div>
          <div className="flex items-center gap-1 text-blue-500 font-medium">
            <Sparkles size={12} />
            <span>Task Flow Hub Palette</span>
          </div>
        </div>
      </div>
    </div>
  )
}
