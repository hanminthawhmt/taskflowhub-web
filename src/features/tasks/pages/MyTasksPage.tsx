import { useState } from 'react'
import { useAuthStore } from '../../../store/useAuthStore'
import { useCompanyProjects } from '../../projects/hooks/useProjects'
import { useMyTasks, useUpdateTaskStatusMutation } from '../hooks/useTasks'
import { CheckCircle2, Circle, AlertCircle, Calendar, Tag } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'

export default function MyTasksPage() {
  const activeCompany = useAuthStore((state) => state.activeCompany)
  const companyId = activeCompany?.id || 'default-comp'

  const { data: projects, isLoading: projectsLoading } = useCompanyProjects(companyId)
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')

  const activeProjectId = selectedProjectId || (projects && projects.length > 0 ? projects[0].id : '')

  const { data: tasks, isLoading: tasksLoading, isError } = useMyTasks(activeProjectId)
  const updateStatusMutation = useUpdateTaskStatusMutation(activeProjectId)

  const handleToggleStatus = async (taskId: string, currentStatus: 'pending' | 'complete') => {
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

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white font-sans">My Tasks</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          List of tasks assigned to you in the selected project workspace.
        </p>
      </div>

      {/* Project Selector bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm">
        <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">
          Select Project Workspace:
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
          ) : tasks && tasks.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {tasks.map((task) => (
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
                      {task.end_date && (
                        <span className="flex items-center gap-1">
                          <Calendar size={12} />
                          Due: {new Date(task.end_date).toLocaleDateString()}
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
