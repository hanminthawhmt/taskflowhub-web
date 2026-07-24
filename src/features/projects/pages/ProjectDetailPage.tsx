import { useState } from 'react'
import { useParams, Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { useAuthStore } from '../../../store/useAuthStore'
import {
  useProjectDetail,
  useProjectMembers,
  useAddProjectMemberMutation,
  useCompanyMembers,
  useRemoveProjectMemberMutation,
  useProjectPendingInvitationsQuery,
  useRevokeProjectInvitationMutation,
} from '../hooks/useProjects'
import {
  useProjectTasks,
  useCreateTaskMutation,
  useUpdateTaskStatusMutation,
  useUpdateTaskMutation,
  useDeleteTaskMutation,
} from '../../tasks/hooks/useTasks'
import {
  ArrowLeft,
  Users,
  BookOpen,
  CheckSquare,
  UserPlus,
  Calendar,
  Clock,
  Shield,
  X,
  Plus,
  AlertCircle,
  CheckCircle2,
  Circle,
  LayoutGrid,
  List,
  Download,
  Filter,
  GripVertical,
  Edit3,
  Trash2,
  UserX,
  Mail,
  Send,
} from 'lucide-react'
import axios from 'axios'
import { toast } from 'sonner'
import { exportToCSV } from '../../../utils/csvExport'
import type { Task } from '../../tasks/types/task'

// Validation schemas
const addMemberSchema = zod.object({
  user_id: zod.string().min(1, 'User ID is required'),
  role_id: zod.enum(['6', '7', '8', '9']),  // project-scope role IDs: 6=Owner, 7=Manager, 8=Developer, 9=Viewer
})

const createTaskSchema = zod.object({
  title: zod.string().min(1, 'Task title is required').max(100, 'Title is too long'),
  description: zod.string().max(500, 'Description is too long').optional(),
  priority: zod.enum(['high', 'medium', 'low']),
  user_id: zod.string().optional(),
  start_date: zod.string().optional(),
  end_date: zod.string().optional(),
})

type AddMemberInputs = zod.infer<typeof addMemberSchema>
type CreateTaskInputs = zod.infer<typeof createTaskSchema>

export default function ProjectDetailPage() {
  const { projectId } = useParams()
  const activeCompany = useAuthStore((state) => state.activeCompany)
  const companyId = activeCompany?.id || 1

  // Queries
  const { data: project, isLoading: projectLoading, isError: projectError } = useProjectDetail(companyId, projectId || '')
  const { data: members, isLoading: membersLoading } = useProjectMembers(companyId, projectId || '')
  const { data: companyMembers } = useCompanyMembers(companyId)
  const { data: tasks, isLoading: tasksLoading, isError: tasksError, refetch: refetchTasks } = useProjectTasks(projectId || '')

  // Mutations & Queries
  const addMemberMutation = useAddProjectMemberMutation(companyId, projectId || '')
  const removeMemberMutation = useRemoveProjectMemberMutation(companyId, projectId || '')
  const { data: projectInvitations } = useProjectPendingInvitationsQuery(projectId || '')
  const revokeProjectInviteMutation = useRevokeProjectInvitationMutation(projectId || '')

  const createTaskMutation = useCreateTaskMutation(projectId || '')
  const updateTaskStatusMutation = useUpdateTaskStatusMutation(projectId || '')
  const updateTaskMutation = useUpdateTaskMutation(projectId || '')
  const deleteTaskMutation = useDeleteTaskMutation(projectId || '')

  const currentUser = useAuthStore((state) => state.user)

  // Determine current user permissions in this project
  const currentUserMember = members?.find((m) => Number(m.userId) === Number(currentUser?.id))
  const userRoleId = Number(currentUserMember?.roleId)
  const userRoleTitle = (currentUserMember?.roleTitle || '').toLowerCase()
  // "update_any_task" & "delete_task" permissions are granted to Owner and Manager roles only
  const canManageTasks =
    userRoleId === 6 ||
    userRoleId === 7 ||
    userRoleId === 1 ||
    userRoleId === 3 ||
    userRoleTitle.includes('owner') ||
    userRoleTitle.includes('manager')

  // Component local states
  const [activeTab, setActiveTab] = useState<'overview' | 'members' | 'tasks'>('overview')
  const [memberModalOpen, setMemberModalOpen] = useState(false)
  const [taskModalOpen, setTaskModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [taskErrorMsg, setTaskErrorMsg] = useState<string | null>(null)
  const [taskSearchQuery, setTaskSearchQuery] = useState('')
  const [taskPriorityFilter, setTaskPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all')
  const [taskViewMode, setTaskViewMode] = useState<'board' | 'list' | 'calendar'>('board')
  const [dragOverColumn, setDragOverColumn] = useState<'pending' | 'complete' | null>(null)

  // Member form
  const addMemberForm = useForm<AddMemberInputs>({
    resolver: zodResolver(addMemberSchema),
    defaultValues: {
      user_id: '',
      role_id: '8',  // Developer by default
    },
  })

  // Task form
  const createTaskForm = useForm<CreateTaskInputs>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      title: '',
      description: '',
      priority: 'medium',
      user_id: '',
      start_date: '',
      end_date: '',
    },
  })

  // Form submit handlers
  const onAddMemberSubmit = async (data: AddMemberInputs) => {
    try {
      setErrorMsg(null)
      // Backend requires integer IDs — HTML selects always return strings, so coerce here
      await addMemberMutation.mutateAsync({
        user_id: Number(data.user_id),
        role_id: Number(data.role_id),
      })
      addMemberForm.reset()
      setMemberModalOpen(false)
      toast.success('Project member added successfully')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.message || 'Failed to add project member.')
      } else {
        setErrorMsg('An unexpected error occurred.')
      }
    }
  }

  const onCreateTaskSubmit = async (data: CreateTaskInputs) => {
    try {
      setTaskErrorMsg(null)
      const payload = {
        ...data,
        user_id: data.user_id || undefined,
        start_date: data.start_date || undefined,
        end_date: data.end_date || undefined,
      }
      await createTaskMutation.mutateAsync(payload)
      createTaskForm.reset()
      setTaskModalOpen(false)
      toast.success('Task created successfully')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setTaskErrorMsg(err.response?.data?.message || 'Failed to create task.')
      } else {
        setTaskErrorMsg('An unexpected error occurred.')
      }
    }
  }

  const handleTaskDelete = async (taskId: number | string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete task "${title}"? This action cannot be undone.`)) {
      return
    }
    try {
      await deleteTaskMutation.mutateAsync(taskId)
      toast.success('Task deleted successfully')
    } catch {
      toast.error('Failed to delete task')
    }
  }

  const handleRemoveMember = async (userId: number | string, name: string) => {
    if (!window.confirm(`Remove ${name} from this project?`)) {
      return
    }
    try {
      await removeMemberMutation.mutateAsync(userId)
      toast.success('Member removed successfully')
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const message = err.response?.data?.message || 'Failed to remove member'
        toast.error(message)
      } else {
        toast.error('An unexpected error occurred')
      }
    }
  }

  const handleRevokeProjectInvite = async (invitationId: number | string, email: string) => {
    if (!window.confirm(`Revoke invitation for ${email}?`)) {
      return
    }
    try {
      await revokeProjectInviteMutation.mutateAsync(invitationId)
      toast.success('Invitation revoked')
    } catch {
      toast.error('Failed to revoke invitation')
    }
  }

  const handleToggleTaskStatus = async (taskId: number | string, currentStatus: 'pending' | 'complete') => {
    const nextStatus = currentStatus === 'pending' ? 'complete' : 'pending'
    try {
      await updateTaskStatusMutation.mutateAsync({
        taskId,
        data: { status: nextStatus },
      })
      toast.success(`Task marked as ${nextStatus}`)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        // Displays exact message if returned (e.g. only assignee can update status)
        toast.error(err.response?.data?.message || 'Only the task assignee can update its status.')
      } else {
        toast.error('An unexpected error occurred.')
      }
    }
  }

  if (projectLoading) {
    return (
      <div className="p-8 max-w-7xl mx-auto space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4"></div>
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded w-1/2"></div>
        <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded"></div>
      </div>
    )
  }

  if (projectError || !project) {
    return (
      <div className="p-8 max-w-md mx-auto text-center space-y-4">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white">Project not found</h3>
        <p className="text-sm text-slate-500">The project you are looking for does not exist or has been deleted.</p>
        <Link to="/dashboard/projects" className="inline-flex items-center gap-2 text-sm font-semibold text-blue-600 dark:text-blue-400">
          <ArrowLeft size={16} /> Back to Projects
        </Link>
      </div>
    )
  }

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, taskId: number) => {
    e.dataTransfer.setData('text/plain', String(taskId))
  }

  const handleDrop = async (e: React.DragEvent, targetStatus: 'pending' | 'complete') => {
    e.preventDefault()
    setDragOverColumn(null)
    const taskIdStr = e.dataTransfer.getData('text/plain')
    if (!taskIdStr) return

    const taskId = Number(taskIdStr)
    const task = tasks?.find((t) => Number(t.id) === taskId)
    if (task && task.status !== targetStatus) {
      try {
        await updateTaskStatusMutation.mutateAsync({ taskId, data: { status: targetStatus } })
        toast.success(`Task moved to ${targetStatus === 'complete' ? 'Completed' : 'Pending'}`)
      } catch {
        toast.error('Failed to update task status')
      }
    }
  }

  // Filter and split tasks
  const filteredTasks = (tasks || []).filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(taskSearchQuery.toLowerCase()) ||
      (t.description && t.description.toLowerCase().includes(taskSearchQuery.toLowerCase()))
    const matchesPriority = taskPriorityFilter === 'all' || t.priority === taskPriorityFilter
    return matchesSearch && matchesPriority
  })

  const pendingTasks = filteredTasks.filter((t) => t.status === 'pending')
  const completedTasks = filteredTasks.filter((t) => t.status === 'complete')

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Back navigation and header */}
      <div className="space-y-3">
        <Link
          to="/dashboard/projects"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {project.title}
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Parent workspace: <span className="font-semibold text-slate-700 dark:text-slate-300">{activeCompany?.name}</span>
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 gap-6">
        {(
          [
            { id: 'overview', name: 'Overview', icon: BookOpen },
            { id: 'members', name: 'Members', icon: Users },
            { id: 'tasks', name: 'Tasks', icon: CheckSquare },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 pb-3.5 text-sm font-medium border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? 'border-blue-600 text-blue-600 dark:border-blue-400 dark:text-blue-400 font-semibold'
                  : 'border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300'
              }`}
            >
              <Icon size={16} />
              <span>{tab.name}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Panels */}
      <div className="mt-4">

        {/* OVERVIEW PANEL */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in">
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-bold text-lg text-slate-950 dark:text-white">About Project</h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {project.description || 'No description provided for this project.'}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="font-bold text-lg text-slate-950 dark:text-white">Timeline & Milestones</h3>
                <div className="space-y-4">
                  <div className="flex gap-4 items-start">
                    <div className="h-8 w-8 min-w-[32px] rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center font-bold text-xs">
                      1
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Project Setup</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Project repository created and workspace environment defined.</p>
                    </div>
                  </div>
                  <div className="flex gap-4 items-start">
                    <div className="h-8 w-8 min-w-[32px] rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center font-bold text-xs">
                      2
                    </div>
                    <div>
                      <h4 className="text-sm font-bold">Tasks Integration</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Kanban sprint board listing and status toggle settings.</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
              <h3 className="font-bold text-lg text-slate-950 dark:text-white">Details</h3>
              <div className="space-y-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Created</span>
                  <span className="font-medium flex items-center gap-1.5 dark:text-slate-200">
                    <Calendar size={14} className="text-slate-400" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Updated</span>
                  <span className="font-medium flex items-center gap-1.5 dark:text-slate-200">
                    <Clock size={14} className="text-slate-400" />
                    {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">Members Count</span>
                  <span className="font-medium flex items-center gap-1.5 dark:text-slate-200">
                    <Users size={14} className="text-slate-400" />
                    {members?.length || 0}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MEMBERS PANEL */}
        {activeTab === 'members' && (
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden animate-fade-in space-y-4 p-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div>
                <h3 className="font-bold text-lg text-slate-950 dark:text-white">Project Members</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">List of users who have direct access to this project.</p>
              </div>
              <button
                onClick={() => { setErrorMsg(null); setMemberModalOpen(true) }}
                className="inline-flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg cursor-pointer"
              >
                <UserPlus size={14} />
                <span>Add Member</span>
              </button>
            </div>

            {membersLoading ? (
              <div className="space-y-3 animate-pulse py-4">
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded"></div>
              </div>
            ) : members && members.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-100 dark:border-slate-800 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4 text-right">Project Role</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50 dark:divide-slate-800/50">
                    {members.map((member) => (
                      <tr key={member.id} className="text-sm">
                        <td className="py-3.5 px-4 flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center uppercase text-xs">
                            {member.user.name.charAt(0)}
                          </div>
                          <span className="font-semibold text-slate-900 dark:text-slate-200">{member.user.name}</span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">{member.user.email}</td>
                        <td className="py-3.5 px-4 text-right flex items-center justify-end gap-3">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-bold rounded-full border ${
                              (() => {
                                const title = (member.roleTitle || String(member.roleId)).toLowerCase()
                                return title === 'owner' || title === '1'
                                  ? 'bg-indigo-50 text-indigo-700 border-indigo-150 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/50'
                                  : title === 'manager' || title === '3'
                                    ? 'bg-amber-50 text-amber-700 border-amber-150 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50'
                                    : title === 'developer' || title === 'member' || title === '2'
                                      ? 'bg-emerald-50 text-emerald-700 border-emerald-150 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/50'
                                      : 'bg-slate-50 text-slate-650 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                              })()
                            }`}
                          >
                            <Shield size={12} />
                            <span className="capitalize">{member.roleTitle || member.roleId}</span>
                          </span>

                          <button
                            onClick={() => handleRemoveMember(member.userId, member.user.name)}
                            className="p-1 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                            title="Remove project member"
                          >
                            <UserX size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10">
                <Users size={32} className="mx-auto text-slate-300 mb-2" />
                <p className="text-sm text-slate-500">No project members listed.</p>
              </div>
            )}

            {/* Pending Project Invitations Sub-Section */}
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                    <Send size={16} className="text-blue-500" />
                    <span>Pending Invitations</span>
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Invitations sent to email addresses that have not been accepted yet.
                  </p>
                </div>
                <span className="px-2.5 py-0.5 text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-900/50">
                  {projectInvitations?.length || 0} Pending
                </span>
              </div>

              {projectInvitations && projectInvitations.length > 0 ? (
                <div className="overflow-x-auto border border-slate-200/60 dark:border-slate-800 rounded-xl">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 uppercase tracking-wider font-semibold">
                        <th className="py-2.5 px-4">Invitee Email</th>
                        <th className="py-2.5 px-4">Role</th>
                        <th className="py-2.5 px-4">Invited By</th>
                        <th className="py-2.5 px-4">Expires</th>
                        <th className="py-2.5 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                      {projectInvitations.map((inv) => (
                        <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors">
                          <td className="py-3 px-4 font-semibold text-slate-900 dark:text-slate-200 flex items-center gap-2">
                            <Mail size={14} className="text-slate-400" />
                            <span>{inv.email}</span>
                          </td>
                          <td className="py-3 px-4">
                            <span className="px-2 py-0.5 font-bold rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                              {inv.roleTitle}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {inv.invitedBy?.name || inv.invitedBy?.email || 'Admin'}
                          </td>
                          <td className="py-3 px-4 text-slate-400">
                            {new Date(inv.expiresAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <button
                              onClick={() => handleRevokeProjectInvite(inv.id, inv.email)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 hover:bg-red-100 rounded-md transition-colors cursor-pointer"
                            >
                              Revoke
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="py-6 text-center text-xs text-slate-400 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-dashed border-slate-200 dark:border-slate-800">
                  No pending invitations for this project.
                </div>
              )}
            </div>
          </div>
        )}

        {/* KANBAN TASKS PANEL */}
        {activeTab === 'tasks' && (
          <div className="space-y-6 animate-fade-in">
            {/* Header Actions & View Switcher */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <div className="flex items-center gap-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-1.5 w-full sm:w-64">
                  <Calendar size={15} className="text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={taskSearchQuery}
                    onChange={(e) => setTaskSearchQuery(e.target.value)}
                    className="bg-transparent border-0 outline-none text-xs w-full focus:ring-0 dark:text-white"
                  />
                </div>

                {/* Priority filter */}
                <div className="flex items-center gap-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-600 dark:text-slate-300">
                  <Filter size={13} className="text-slate-400" />
                  <select
                    value={taskPriorityFilter}
                    onChange={(e) => setTaskPriorityFilter(e.target.value as 'all' | 'high' | 'medium' | 'low')}
                    className="bg-transparent border-none outline-none cursor-pointer focus:ring-0 text-xs dark:text-white"
                  >
                    <option value="all" className="dark:bg-slate-900">All Priorities</option>
                    <option value="high" className="dark:bg-slate-900">High Priority</option>
                    <option value="medium" className="dark:bg-slate-900">Medium Priority</option>
                    <option value="low" className="dark:bg-slate-900">Low Priority</option>
                  </select>
                </div>

                {/* View switcher tabs */}
                <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200/60 dark:border-slate-700">
                  <button
                    onClick={() => setTaskViewMode('board')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      taskViewMode === 'board'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <LayoutGrid size={13} />
                    <span>Board</span>
                  </button>
                  <button
                    onClick={() => setTaskViewMode('list')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      taskViewMode === 'list'
                        ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs font-semibold'
                        : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                    }`}
                  >
                    <List size={13} />
                    <span>List</span>
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (!filteredTasks || filteredTasks.length === 0) return
                    exportToCSV(
                      filteredTasks.map((t) => ({
                        TaskID: t.id,
                        Title: t.title,
                        Status: t.status,
                        Priority: t.priority,
                        Assignee: t.assignee?.name || '',
                        StartDate: t.startDate || '',
                        EndDate: t.endDate || '',
                      })),
                      `${project.title}_Tasks`
                    )
                    toast.success('Tasks exported to CSV')
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors rounded-lg cursor-pointer"
                >
                  <Download size={14} />
                  <span>Export CSV</span>
                </button>

                <button
                  onClick={() => { setTaskErrorMsg(null); setTaskModalOpen(true) }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg cursor-pointer shadow-sm shadow-blue-500/10"
                >
                  <Plus size={16} />
                  <span>Add Task</span>
                </button>
              </div>
            </div>

            {tasksLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-pulse">
                <div className="h-64 bg-slate-100 dark:bg-slate-900 rounded-xl"></div>
                <div className="h-64 bg-slate-100 dark:bg-slate-900 rounded-xl"></div>
              </div>
            ) : tasksError ? (
              <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
                <AlertCircle size={40} className="text-red-500 mb-2" />
                <h3 className="font-bold text-base text-slate-950 dark:text-white">Failed to load tasks</h3>
                <button
                  onClick={() => refetchTasks()}
                  className="mt-3 inline-flex items-center justify-center px-3 py-1.5 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 rounded-lg text-xs font-semibold"
                >
                  Retry
                </button>
              </div>
            ) : taskViewMode === 'board' ? (
              /* Two Column Drag-and-Drop Kanban Board */
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* 1. Pending Column */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOverColumn('pending')
                  }}
                  onDragLeave={() => setDragOverColumn(null)}
                  onDrop={(e) => handleDrop(e, 'pending')}
                  className={`p-4 rounded-xl border transition-all duration-200 space-y-4 min-h-[380px] ${
                    dragOverColumn === 'pending'
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-blue-400 dark:border-blue-600 ring-2 ring-blue-500/20'
                      : 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between px-2">
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span>Pending Tasks</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Drag to reorder)</span>
                    </span>
                    <span className="px-2 py-0.5 text-xs font-bold bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-full">
                      {pendingTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {pendingTasks.length > 0 ? (
                      pendingTasks.map(task => {
                        const assigneeUser = task.assignee || members?.find(m => Number(m.userId) === Number(task.user_id))?.user
                        const assigneeName = assigneeUser?.name || ''
                        return (
                          <div 
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, Number(task.id))}
                            className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-grab active:cursor-grabbing hover:shadow-md group"
                          >
                            <div className="flex items-start gap-3">
                              <GripVertical size={16} className="text-slate-300 dark:text-slate-700 group-hover:text-slate-400 shrink-0 mt-0.5" />
                              <button
                                onClick={() => handleToggleTaskStatus(task.id, task.status)}
                                disabled={updateTaskStatusMutation.isPending}
                                className="mt-0.5 text-slate-400 hover:text-blue-600 cursor-pointer shrink-0"
                              >
                                <Circle size={18} />
                              </button>
                              <div className="space-y-1 flex-1">
                                <h4 className="font-semibold text-sm text-slate-900 dark:text-white leading-tight">
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800/40">
                              <div className="flex items-center gap-2">
                                <span className={`inline-block px-1.5 py-0.5 text-[9px] font-bold rounded uppercase ${
                                  task.priority === 'high' 
                                    ? 'bg-red-50 text-red-600 dark:bg-red-950/20 dark:text-red-400' 
                                    : task.priority === 'medium'
                                      ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20'
                                      : 'bg-green-50 text-green-600 dark:bg-green-950/20'
                                }`}>
                                  {task.priority}
                                </span>
                              </div>

                              <div className="flex items-center gap-2">
                                {canManageTasks && (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => setEditingTask(task)}
                                      className="p-1 rounded text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
                                      title="Edit Task"
                                    >
                                      <Edit3 size={13} />
                                    </button>
                                    <button
                                      onClick={() => handleTaskDelete(task.id, task.title)}
                                      className="p-1 rounded text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors cursor-pointer"
                                      title="Delete Task"
                                    >
                                      <Trash2 size={13} />
                                    </button>
                                  </div>
                                )}
                                {assigneeUser && assigneeName && (
                                  <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[9px] font-bold text-blue-600 dark:text-blue-400 uppercase shadow-sm" title={assigneeName}>
                                    {assigneeName.charAt(0)}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-12 text-slate-400 text-xs">
                        No pending tasks.
                      </div>
                    )}
                  </div>
                </div>

                {/* 2. Completed Column */}
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragOverColumn('complete')
                  }}
                  onDragLeave={() => setDragOverColumn(null)}
                  onDrop={(e) => handleDrop(e, 'complete')}
                  className={`p-4 rounded-xl border transition-all duration-200 space-y-4 min-h-[380px] ${
                    dragOverColumn === 'complete'
                      ? 'bg-green-50/70 dark:bg-green-950/40 border-green-400 dark:border-green-600 ring-2 ring-green-500/20'
                      : 'bg-slate-100/50 dark:bg-slate-900/40 border-slate-200/50 dark:border-slate-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between px-2">
                    <span className="font-bold text-sm text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <span>Completed Tasks</span>
                      <span className="text-[10px] text-slate-400 font-normal">(Drag here to complete)</span>
                    </span>
                    <span className="px-2 py-0.5 text-xs font-bold bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-400 rounded-full">
                      {completedTasks.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {completedTasks.length > 0 ? (
                      completedTasks.map((task) => {
                        const assigneeUser = task.assignee || members?.find((m) => Number(m.userId) === Number(task.user_id))?.user
                        const assigneeName = assigneeUser?.name || ''
                        return (
                          <div
                            key={task.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, Number(task.id))}
                            className="bg-white dark:bg-slate-900 p-4 rounded-lg border border-slate-200/60 dark:border-slate-800 shadow-sm space-y-3 hover:border-slate-300 dark:hover:border-slate-700 transition-all cursor-grab active:cursor-grabbing hover:shadow-md group opacity-75"
                          >
                            <div className="flex items-start gap-3">
                              <GripVertical size={16} className="text-slate-300 dark:text-slate-700 group-hover:text-slate-400 shrink-0 mt-0.5" />
                              <button
                                onClick={() => handleToggleTaskStatus(task.id, task.status)}
                                disabled={updateTaskStatusMutation.isPending}
                                className="mt-0.5 text-green-500 hover:text-slate-400 cursor-pointer shrink-0"
                              >
                                <CheckCircle2 size={18} />
                              </button>
                              <div className="space-y-1 flex-1">
                                <h4 className="font-semibold text-sm text-slate-900 dark:text-white leading-tight line-through">
                                  {task.title}
                                </h4>
                                {task.description && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center justify-between pt-2 border-t border-slate-50 dark:border-slate-800/40">
                              <span className="inline-block px-1.5 py-0.5 text-[9px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-400 rounded uppercase">
                                Completed
                              </span>
                              {assigneeUser && assigneeName && (
                                <div className="h-5 w-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-[9px] font-bold text-slate-400 uppercase shadow-sm" title={assigneeName}>
                                  {assigneeName.charAt(0)}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      })
                    ) : (
                      <div className="text-center py-12 text-slate-400 text-xs">
                        No completed tasks.
                      </div>
                    )}
                  </div>
                </div>

              </div>
            ) : (
              /* List View Mode */
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Task Title</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4">Priority</th>
                      <th className="py-3 px-4">Assignee</th>
                      <th className="py-3 px-4 text-right">Dates</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
                    {filteredTasks.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-400">
                          No tasks match the selected filters.
                        </td>
                      </tr>
                    ) : (
                      filteredTasks.map((t) => {
                        const assigneeUser = t.assignee || members?.find(m => Number(m.userId) === Number(t.user_id))?.user
                        const assigneeName = assigneeUser?.name || 'Unassigned'
                        return (
                          <tr key={t.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-white">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => handleToggleTaskStatus(t.id, t.status)}
                                  className="text-slate-400 hover:text-blue-600 cursor-pointer"
                                >
                                  {t.status === 'complete' ? (
                                    <CheckCircle2 size={16} className="text-green-500" />
                                  ) : (
                                    <Circle size={16} />
                                  )}
                                </button>
                                <span className={t.status === 'complete' ? 'line-through text-slate-400' : ''}>
                                  {t.title}
                                </span>
                              </div>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                                t.status === 'complete'
                                  ? 'bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-400'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}>
                                {t.status}
                              </span>
                            </td>
                            <td className="py-3.5 px-4">
                              <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full uppercase ${
                                t.priority === 'high'
                                  ? 'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400 border border-red-200 dark:border-red-900/50'
                                  : t.priority === 'medium'
                                  ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50'
                                  : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                              }`}>
                                {t.priority}
                              </span>
                            </td>
                            <td className="py-3.5 px-4 text-slate-600 dark:text-slate-400">
                              {assigneeName}
                            </td>
                            <td className="py-3.5 px-4 text-right text-slate-400">
                              {t.endDate ? new Date(t.endDate).toLocaleDateString() : 'No deadline'}
                            </td>
                          </tr>
                        )
                      })
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Add Project Member Modal Dialog */}
      {memberModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">Add Project Member</h3>
              <button
                onClick={() => setMemberModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {errorMsg && (
              <div className="mx-6 mt-4 p-3 bg-red-50 text-red-600 border border-red-100 text-sm rounded-lg dark:bg-red-950/30 dark:border-red-900 dark:text-red-400">
                {errorMsg}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={addMemberForm.handleSubmit(onAddMemberSubmit)} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Select Member <span className="text-red-500">*</span>
                </label>
                <select
                  disabled={addMemberMutation.isPending}
                  {...addMemberForm.register('user_id')}
                  className={`mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border border-slate-200 dark:border-slate-800 dark:bg-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 ${
                    addMemberForm.formState.errors.user_id ? 'border-red-500' : ''
                  }`}
                >
                  <option value="">Choose a company member...</option>
                  {companyMembers?.map((m) => (
                    <option key={m.userId} value={String(m.userId)}>
                      {m.user.name} ({m.user.email})
                    </option>
                  ))}
                </select>
                {addMemberForm.formState.errors.user_id && (
                  <p className="mt-1.5 text-xs text-red-500">{addMemberForm.formState.errors.user_id.message}</p>
                )}
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Directly add an existing company user to this project.</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Project Role <span className="text-red-500">*</span>
                </label>
                <select
                  disabled={addMemberMutation.isPending}
                  {...addMemberForm.register('role_id')}
                  className="mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border border-slate-200 dark:border-slate-800 dark:bg-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                >
                  <option value="8">Developer</option>
                  <option value="7">Manager</option>
                  <option value="9">Viewer</option>
                  <option value="6">Owner</option>
                </select>
                {addMemberForm.formState.errors.role_id && (
                  <p className="mt-1.5 text-xs text-red-500">{addMemberForm.formState.errors.role_id.message}</p>
                )}
              </div>

              {/* Form Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={addMemberMutation.isPending}
                  onClick={() => setMemberModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addMemberMutation.isPending}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {addMemberMutation.isPending ? 'Adding...' : 'Add Member'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Create Task Modal Dialog */}
      {taskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">Add New Task</h3>
              <button
                onClick={() => setTaskModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            {taskErrorMsg && (
              <div className="mx-6 mt-4 p-3 bg-red-50 text-red-600 border border-red-100 text-sm rounded-lg dark:bg-red-950/30 dark:border-red-900 dark:text-red-400">
                {taskErrorMsg}
              </div>
            )}

            {/* Modal Form */}
            <form onSubmit={createTaskForm.handleSubmit(onCreateTaskSubmit)} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Design Dashboard Prototypes"
                  disabled={createTaskMutation.isPending}
                  {...createTaskForm.register('title')}
                  className={`mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-900 dark:text-white ${
                    createTaskForm.formState.errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
                {createTaskForm.formState.errors.title && (
                  <p className="mt-1.5 text-xs text-red-500">{createTaskForm.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  placeholder="Summarize the work required..."
                  disabled={createTaskMutation.isPending}
                  rows={3}
                  {...createTaskForm.register('description')}
                  className={`mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-900 dark:text-white ${
                    createTaskForm.formState.errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
                {createTaskForm.formState.errors.description && (
                  <p className="mt-1.5 text-xs text-red-500">{createTaskForm.formState.errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Priority <span className="text-red-500">*</span>
                  </label>
                  <select
                    disabled={createTaskMutation.isPending}
                    {...createTaskForm.register('priority')}
                    className="mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border border-slate-200 dark:border-slate-800 dark:bg-gray-900 dark:text-white rounded-lg text-sm focus:outline-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Assignee User
                  </label>
                  <select
                    disabled={createTaskMutation.isPending}
                    {...createTaskForm.register('user_id')}
                    className="mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border border-slate-200 dark:border-slate-800 dark:bg-gray-900 dark:text-white rounded-lg text-sm focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {members?.map(m => (
                      <option key={m.userId} value={String(m.userId)}>
                        {m.user.name} ({m.roleTitle || m.roleId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Start Date
                  </label>
                  <input
                    type="date"
                    disabled={createTaskMutation.isPending}
                    {...createTaskForm.register('start_date')}
                    className="mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border border-slate-200 dark:border-slate-800 dark:bg-gray-900 dark:text-white rounded-lg text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    End Date / Due Date
                  </label>
                  <input
                    type="date"
                    disabled={createTaskMutation.isPending}
                    {...createTaskForm.register('end_date')}
                    className="mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border border-slate-200 dark:border-slate-800 dark:bg-gray-900 dark:text-white rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>

              {/* Form Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={createTaskMutation.isPending}
                  onClick={() => setTaskModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createTaskMutation.isPending}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Edit Task Modal Dialog */}
      {editingTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white flex items-center gap-2">
                <Edit3 size={18} className="text-blue-500" />
                <span>Edit Task</span>
              </h3>
              <button
                onClick={() => setEditingTask(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>

            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const title = formData.get('title') as string
                const description = formData.get('description') as string
                const priority = formData.get('priority') as 'high' | 'medium' | 'low'
                const user_id_str = formData.get('user_id') as string
                const start_date = formData.get('start_date') as string
                const end_date = formData.get('end_date') as string

                try {
                  await updateTaskMutation.mutateAsync({
                    taskId: editingTask.id,
                    data: {
                      title: title || undefined,
                      description: description || undefined,
                      priority: priority || undefined,
                      user_id: user_id_str ? Number(user_id_str) : undefined,
                      start_date: start_date || undefined,
                      end_date: end_date || undefined,
                    },
                  })
                  setEditingTask(null)
                  toast.success('Task updated successfully')
                } catch (err: unknown) {
                  if (axios.isAxiosError(err)) {
                    toast.error(err.response?.data?.message || 'Failed to update task')
                  } else {
                    toast.error('An error occurred while updating task')
                  }
                }
              }}
              className="px-6 py-4 space-y-4"
            >
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Task Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  defaultValue={editingTask.title}
                  required
                  className="mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border border-slate-200 dark:border-slate-800 dark:bg-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  name="description"
                  defaultValue={editingTask.description || ''}
                  rows={3}
                  className="mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border border-slate-200 dark:border-slate-800 dark:bg-gray-900 dark:text-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Priority
                  </label>
                  <select
                    name="priority"
                    defaultValue={editingTask.priority}
                    className="mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border border-slate-200 dark:border-slate-800 dark:bg-gray-900 dark:text-white rounded-lg text-sm focus:outline-none"
                  >
                    <option value="low">Low Priority</option>
                    <option value="medium">Medium Priority</option>
                    <option value="high">High Priority</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Assignee User
                  </label>
                  <select
                    name="user_id"
                    defaultValue={editingTask.assignee?.id || editingTask.user_id || ''}
                    className="mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border border-slate-200 dark:border-slate-800 dark:bg-gray-900 dark:text-white rounded-lg text-sm focus:outline-none"
                  >
                    <option value="">Unassigned</option>
                    {members?.map((m) => (
                      <option key={m.userId} value={String(m.userId)}>
                        {m.user.name} ({m.roleTitle || m.roleId})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Start Date
                  </label>
                  <input
                    type="date"
                    name="start_date"
                    defaultValue={editingTask.startDate ? editingTask.startDate.slice(0, 10) : ''}
                    className="mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border border-slate-200 dark:border-slate-800 dark:bg-gray-900 dark:text-white rounded-lg text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    End Date / Due Date
                  </label>
                  <input
                    type="date"
                    name="end_date"
                    defaultValue={editingTask.endDate ? editingTask.endDate.slice(0, 10) : ''}
                    className="mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border border-slate-200 dark:border-slate-800 dark:bg-gray-900 dark:text-white rounded-lg text-sm focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingTask(null)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateTaskMutation.isPending}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {updateTaskMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}
