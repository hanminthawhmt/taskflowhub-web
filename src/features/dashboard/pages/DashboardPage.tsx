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

// Mock data for analytics
const chartData = [
  { name: 'Mon', completed: 4, created: 6 },
  { name: 'Tue', completed: 8, created: 5 },
  { name: 'Wed', completed: 5, created: 8 },
  { name: 'Thu', completed: 10, created: 7 },
  { name: 'Fri', completed: 12, created: 10 },
  { name: 'Sat', completed: 6, created: 4 },
  { name: 'Sun', completed: 7, created: 5 },
]

const recentActivities = [
  { id: 1, user: 'John Doe', action: 'completed task', target: 'Design Auth Layout', time: '2 hours ago' },
  { id: 2, user: 'Sarah Connor', action: 'created project', target: 'T-800 Migration', time: '4 hours ago' },
  { id: 3, user: 'James Smith', action: 'added assignee', target: 'Setup Prisma ORM config', time: '1 day ago' },
  { id: 4, user: 'Emily Watson', action: 'changed status', target: 'Stripe Webhook integration', time: '2 days ago' },
]

const upcomingDeadlines = [
  { id: 1, title: 'API Route Security Review', project: 'Core Engine', due: 'Tomorrow', priority: 'High' },
  { id: 2, title: 'React 19 Compatibility Test', project: 'TaskSaaS Frontend', due: 'In 3 days', priority: 'Medium' },
  { id: 3, title: 'Database Index Optimization', project: 'Analytics Service', due: 'In 5 days', priority: 'Low' },
]

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user)
  const activeCompany = useAuthStore((state) => state.activeCompany)

  const stats = [
    { name: 'Active Projects', value: '4', icon: Folder, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/30 dark:text-blue-400' },
    { name: 'Tasks Completed', value: '52', icon: CheckCircle, color: 'text-green-600 bg-green-50 dark:bg-green-950/30 dark:text-green-400' },
    { name: 'Pending Tasks', value: '18', icon: Clock, color: 'text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30 dark:text-yellow-400' },
    { name: 'Success Rate', value: '74%', icon: TrendingUp, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/30 dark:text-purple-400' },
  ]

  return (
    <div className="space-y-8 p-6 max-w-7xl mx-auto">

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

        {/* Quick action buttons */}
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 cursor-pointer transition-colors shadow-sm">
            Generate Report
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
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
        })}
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
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
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
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
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
        </div>

        {/* Upcoming Deadlines */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
          <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
            <h3 className="font-bold text-lg text-slate-950 dark:text-white">Upcoming Deadlines</h3>
          </div>
          <div className="space-y-4">
            {upcomingDeadlines.map((item) => (
              <div
                key={item.id}
                className="flex items-start justify-between p-3 bg-slate-50 dark:bg-slate-800/40 rounded-lg border border-slate-100 dark:border-slate-800"
              >
                <div className="space-y-1">
                  <span className="font-semibold text-sm block truncate max-w-[150px]">{item.title}</span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 block">{item.project}</span>
                </div>
                <div className="text-right space-y-1">
                  <span className="text-xs font-semibold block text-slate-700 dark:text-slate-300">{item.due}</span>
                  <span
                    className={`inline-block px-1.5 py-0.5 text-[10px] font-bold rounded uppercase ${
                      item.priority === 'High'
                        ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400'
                        : item.priority === 'Medium'
                          ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400'
                          : 'bg-green-50 text-green-600 dark:bg-green-950/20 dark:text-green-400'
                    }`}
                  >
                    {item.priority}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Lower section: Recent Activities */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
        <div className="border-b border-slate-100 dark:border-slate-800 pb-4">
          <h3 className="font-bold text-lg text-slate-950 dark:text-white">Recent Activity</h3>
        </div>
        <div className="flow-root">
          <ul className="-mb-8">
            {recentActivities.map((activity, idx) => (
              <li key={activity.id}>
                <div className="relative pb-8">
                  {idx !== recentActivities.length - 1 && (
                    <span className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-slate-100 dark:bg-slate-800" aria-hidden="true" />
                  )}
                  <div className="relative flex space-x-3">
                    <div>
                      <span className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-950/50 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold ring-8 ring-white dark:ring-slate-900">
                        {activity.user.charAt(0)}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0 pt-1.5 flex justify-between space-x-4">
                      <div>
                        <p className="text-sm text-slate-600 dark:text-slate-300">
                          <span className="font-semibold text-slate-900 dark:text-white">{activity.user}</span>{' '}
                          {activity.action}{' '}
                          <span className="font-semibold text-slate-900 dark:text-white">{activity.target}</span>
                        </p>
                      </div>
                      <div className="text-right text-xs whitespace-nowrap text-slate-500 dark:text-slate-400">
                        {activity.time}
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

    </div>
  )
}
