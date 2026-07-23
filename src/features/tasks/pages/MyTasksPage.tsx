import { useState } from 'react'
import { useAuthStore } from '../../../store/useAuthStore'
import { useCompanyProjects } from '../../projects/hooks/useProjects'
import { useMyTasks, useUpdateTaskStatusMutation } from '../hooks/useTasks'
import { CheckCircle2, Circle, AlertCircle, Calendar, Tag, Download, Filter } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { exportToCSV } from '../../../utils/csvExport'

export default function MyTasksPage() {
  const activeCompany = useAuthStore((state) => state.activeCompany)
  const companyId = activeCompany?.id || 1

  const { data: projects, isLoading: projectsLoading } = useCompanyProjects(companyId)
  const [selectedProjectId, setSelectedProjectId] = useState<string | number>('')
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')

  const activeProjectId = selectedProjectId || (projects && projects.length > 0 ? projects[0].id : '')

  const { data: tasks, isLoading: tasksLoading, isError } = useMyTasks(activeProjectId)
  const updateStatusMutation = useUpdateTaskStatusMutation(activeProjectId)

  const handleToggleStatus = async (taskId: number | string, currentStatus: 'pending' | 'complete') => {
    const nextStatus = currentStatus === 'pending' ? 'complete' : 'pending'
    try {
      await updateStatusMutation.mutateAsync({
        taskId,
        data: { status: nextStatus },
      })
      toast.success(`Task status updated to ${nextStatus}`)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        toast.error(err.response?.data?.message || 'Failed to update task status')
      } else {
        toast.error('An unexpected error occurred')
      }
    }
  }

  const filteredTasks = (tasks || []).filter(
    (t) => priorityFilter === 'all' || t.priority === priorityFilter
  )

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">My Tasks</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            List of tasks assigned to you in the selected project workspace.
          </p>
        </div>

        <button
          onClick={() => {
            if (!filteredTasks || filteredTasks.length === 0) return
            exportToCSV(
              filteredTasks.map((t) => ({
                TaskID: t.id,
                Title: t.title,
                Status: t.status,
                Priority: t.priority,
                DueDate: t.endDate || '',
              })),
              `My_Tasks_${activeCompany?.name || 'Workspace'}`
            )
            toast.success('My Tasks exported to CSV')
          }}
          className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors rounded-lg cursor-pointer shrink-0"
        >
          <Download size={15} />
          <span>Export CSV</span>
        </button>
      </div>

      {/* Project Selector & Priority Filter bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex items-center gap-3 flex-1">
          <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 shrink-0">
            Project:
          </label>
          {projectsLoading ? (
            <div className="h-9 w-48 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
          ) : projects && projects.length > 0 ? (
            <select
              value={activeProjectId}
              onChange={(e) => setSelectedProjectId(e.target.value)}
              className="block w-full sm:w-64 px-3 py-2 bg-gray-50 border border-slate-200 dark:border-slate-800 dark:bg-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 cursor-pointer"
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.title}
                </option>
              ))}
            </select>
          ) : (
            <span className="text-sm text-slate-500">No projects available.</span>
          )}
        </div>

        {/* Priority Filter */}
        <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-300">
          <Filter size={15} className="text-slate-400" />
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value as 'all' | 'high' | 'medium' | 'low')}
            className="bg-transparent border-none outline-none text-sm cursor-pointer dark:text-white focus:ring-0"
          >
            <option value="all" className="dark:bg-slate-900">All Priorities</option>
            <option value="high" className="dark:bg-slate-900">High Priority</option>
            <option value="medium" className="dark:bg-slate-900">Medium Priority</option>
            <option value="low" className="dark:bg-slate-900">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Tasks checklist section */}
      {activeProjectId && (
        <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden p-6 space-y-4">
          {tasksLoading ? (
            <div className="space-y-3 animate-pulse">
              <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
              <div className="h-12 bg-slate-100 dark:bg-slate-800 rounded-lg"></div>
            </div>
          ) : isError ? (
            <div className="text-center py-6 text-red-500 text-sm flex items-center justify-center gap-2">
              <AlertCircle size={18} />
              <span>Failed to fetch tasks for this project.</span>
            </div>
          ) : filteredTasks && filteredTasks.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTasks.map((task) => (
                <div key={task.id} className="flex items-start gap-4 py-4 first:pt-0 last:pb-0 group">
                  <button
                    onClick={() => handleToggleStatus(task.id, task.status)}
                    disabled={updateStatusMutation.isPending}
                    className="mt-0.5 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer transition-colors"
                  >
                    {task.status === 'complete' ? (
                      <CheckCircle2 size={20} className="text-green-500 fill-green-50 dark:fill-green-950/20" />
                    ) : (
                      <Circle size={20} />
                    )}
                  </button>

                  <div className="flex-1 space-y-1.5 min-w-0">
                    <h3 className={`font-semibold text-sm transition-all ${
                      task.status === 'complete'
                        ? 'line-through text-slate-400 dark:text-slate-500'
                        : 'text-slate-900 dark:text-white'
                    }`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className={`text-xs ${
                        task.status === 'complete' ? 'text-slate-400' : 'text-slate-500 dark:text-slate-400'
                      } line-clamp-2`}>
                        {task.description}
                      </p>
                    )}

                    {/* Meta info badges */}
                    <div className="flex flex-wrap items-center gap-3 pt-1 text-[10px] text-slate-400">
                      {(task.endDate || task.startDate) && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Due: {new Date(task.endDate || task.startDate || '').toLocaleDateString()}
                        </span>
                      )}

                      <span className="flex items-center gap-1 uppercase font-bold">
                        <Tag size={12} />
                        <span className={
                          task.priority === 'high'
                            ? 'text-red-500'
                            : task.priority === 'medium'
                              ? 'text-yellow-500'
                              : 'text-green-500'
                        }>
                          {task.priority} Priority
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <CheckCircle2 size={36} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm font-semibold text-slate-900 dark:text-white">All caught up!</p>
              <p className="text-xs text-slate-500 mt-0.5">No pending tasks are currently assigned to you in this project.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
