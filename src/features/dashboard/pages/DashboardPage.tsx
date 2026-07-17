import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import {
  Folder,
  CheckCircle,
  Clock,
  TrendingUp,
  ArrowUpRight
} from 'lucide-react'
import { useAuthStore } from '../../../store/useAuthStore'

import {
  useCompanyStats,
  useWeeklyAnalytics,
  useActivityLogs,
  useUpcomingTasks
} from '../hooks/useDashboard'

const formatDueDate = (dateStr: string, today: Date) => {
  try {
    const d = new Date(dateStr)
    const targetDate = new Date(d)
    targetDate.setHours(0, 0, 0, 0)

    const diffTime = targetDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays > 1 && diffDays <= 7) return `In ${diffDays} days`
    return d.toLocaleDateString()
  } catch {
    return dateStr
  }
}

const formatRelativeTime = (dateStr: string, nowTime: number) => {
  try {
    const d = new Date(dateStr)
    const diffTime = nowTime - d.getTime()
    const diffMins = Math.floor(diffTime / (1000 * 60))
    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHrs = Math.floor(diffMins / 60)
    if (diffHrs < 24) return `${diffHrs}h ago`
    const diffDays = Math.floor(diffHrs / 24)
    return `${diffDays}d ago`
  } catch {
    return dateStr
  }
}

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const activeCompany = useAuthStore((state) => state.activeCompany)
  const companyId = activeCompany?.id || 0

  // Live queries
  const { data: stats, isLoading: loadingStats } = useCompanyStats(companyId)
  const { data: weeklyAnalytics, isLoading: loadingAnalytics } = useWeeklyAnalytics(companyId)
  const { data: activityLogs, isLoading: loadingActivities } = useActivityLogs(companyId)
  const { data: upcomingTasks, isLoading: loadingTasks } = useUpcomingTasks(companyId)

  const now = new Date()
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const statsList = [
    { name: 'Total Projects', value: stats ? String(stats.activeProjects) : '0', icon: Folder, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400' },
    { name: 'Tasks Completed', value: stats ? String(stats.tasksCompleted) : '0', icon: CheckCircle, color: 'text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400' },
    { name: 'Pending Tasks', value: stats ? String(stats.pendingTasks) : '0', icon: Clock, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400' },
    { name: 'Success Rate', value: stats ? `${stats.successRate}%` : '0%', icon: TrendingUp, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400' },
  ]

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto animate-fade-in">

      {/* Header section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {user?.name || 'User'}!
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Here's what is happening at <span className="font-semibold text-slate-700 dark:text-slate-200">{activeCompany?.name || 'your workspace'}</span>.
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {loadingStats ? (
          [1, 2, 3, 4].map(idx => (
            <div key={idx} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm h-24 animate-pulse flex items-center justify-between">
              <div className="space-y-2 w-2/3">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/3"></div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-slate-200 dark:bg-slate-800"></div>
            </div>
          ))
        ) : (
          statsList.map((stat) => {
            const Icon = stat.icon
            return (
              <div
                key={stat.name}
                className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between transition-all hover:shadow-md"
              >
                <div className="space-y-1">
                  <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.name}</span>
                  <div className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">{stat.value}</div>
                </div>
                <div className={`p-3 rounded-xl ${stat.color}`}>
                  <Icon size={24} />
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Recharts Area Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-lg text-slate-950 dark:text-white">Task Activity</h3>
            <span className="text-xs font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-1">
              This Week <ArrowUpRight size={14} />
            </span>
          </div>

          {loadingAnalytics ? (
            <div className="h-72 w-full bg-slate-50 dark:bg-slate-900/50 rounded-xl animate-pulse flex items-center justify-center text-xs text-slate-400">
              Loading analytics chart...
            </div>
          ) : weeklyAnalytics && weeklyAnalytics.length > 0 ? (
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyAnalytics} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorCreated" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-100 dark:stroke-slate-800" />
                  <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--background)',
                      borderColor: 'var(--border)',
                      borderRadius: '8px'
                    }}
                  />
                  <Area type="monotone" dataKey="completed" name="Completed" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorCompleted)" />
                  <Area type="monotone" dataKey="created" name="Created" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorCreated)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-72 w-full flex items-center justify-center border border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400 text-xs">
              No weekly analytics data recorded.
            </div>
          )}
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4 flex flex-col">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-lg text-slate-950 dark:text-white">Upcoming Deadlines</h3>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto">
            {loadingTasks ? (
              [1, 2, 3].map(idx => (
                <div key={idx} className="h-16 bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-lg animate-pulse"></div>
              ))
            ) : upcomingTasks && upcomingTasks.length > 0 ? (
              upcomingTasks.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800"
                >
                  <div className="space-y-1 min-w-0 flex-1 pr-2">
                    <span className="font-semibold text-sm block truncate" title={item.title}>{item.title}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400 block truncate">{item.projectTitle}</span>
                  </div>
                  <div className="text-right space-y-1 shrink-0">
                    <span className="text-xs font-semibold block text-slate-700 dark:text-slate-300">{formatDueDate(item.endDate, today)}</span>
                    <span
                      className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded uppercase ${
                        item.priority === 'high'
                          ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                          : item.priority === 'medium'
                            ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400'
                            : 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400'
                      }`}
                    >
                      {item.priority}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="h-full flex flex-col items-center justify-center py-12 text-center">
                <CheckCircle size={32} className="text-slate-300 dark:text-slate-700 mb-2" />
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-400">All caught up!</p>
                <p className="text-[10px] text-slate-500">No tasks with upcoming deadlines in your projects.</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Lower section: Recent Activities */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="font-bold text-lg text-slate-950 dark:text-white">Recent Activity</h3>
        </div>

        <div className="flow-root">
          {loadingActivities ? (
            <div className="space-y-4 py-4 animate-pulse">
              <div className="h-8 bg-slate-50 dark:bg-slate-900/50 rounded-lg"></div>
              <div className="h-8 bg-slate-50 dark:bg-slate-900/50 rounded-lg"></div>
            </div>
          ) : activityLogs && activityLogs.data && activityLogs.data.length > 0 ? (
            <ul className="-mb-8">
              {activityLogs.data.map((activity, idx) => (
                <li key={activity.id}>
                  <div className="relative pb-8">
                    {idx !== activityLogs.data.length - 1 && (
                      <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100 dark:bg-slate-800" aria-hidden="true" />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold ring-8 ring-white dark:ring-slate-900">
                          {activity.userName.charAt(0)}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                        <div>
                          <p className="text-sm text-slate-600 dark:text-slate-300">
                            <span className="font-semibold text-slate-900 dark:text-white">{activity.userName}</span>{' '}
                            {activity.action}{' '}
                            {activity.target && (
                              <span className="font-semibold text-slate-900 dark:text-white">{activity.target}</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right text-xs whitespace-nowrap text-slate-500 dark:text-slate-400">
                          {formatRelativeTime(activity.createdAt, now.getTime())}
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center text-slate-400 text-xs">
              <TrendingUp size={28} className="text-slate-300 dark:text-slate-700 mb-2" />
              <p className="font-semibold text-slate-700 dark:text-slate-450">No recent activity</p>
              <p className="text-[10px] text-slate-500 mt-0.5">Workspace actions and task log events will appear here.</p>
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

