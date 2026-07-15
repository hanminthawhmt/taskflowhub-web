import { useState } from 'react'
import { Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as zod from 'zod'
import { useAuthStore } from '../../../store/useAuthStore'
import { useCompanyProjects, useCreateProjectMutation } from '../hooks/useProjects'
import { Plus, Search, Calendar, Folder, MoreVertical, X } from 'lucide-react'
import axios from 'axios'

const createProjectSchema = zod.object({
  title: zod.string().min(1, 'Project title is required').max(100, 'Title is too long'),
  description: zod.string().max(500, 'Description is too long').optional(),
})

type CreateProjectInputs = zod.infer<typeof createProjectSchema>

export default function ProjectsPage() {
  const activeCompany = useAuthStore((state) => state.activeCompany)
  const companyId = activeCompany?.id || 'default-comp'

  const { data: projects, isLoading, isError, refetch } = useCompanyProjects(companyId)
  const createMutation = useCreateProjectMutation(companyId)

  const [searchQuery, setSearchQuery] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateProjectInputs>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      title: '',
      description: '',
    },
  })

  const onSubmit = async (data: CreateProjectInputs) => {
    try {
      setErrorMsg(null)
      await createMutation.mutateAsync(data)
      reset()
      setModalOpen(false)
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setErrorMsg(err.response?.data?.message || 'Failed to create project.')
      } else {
        setErrorMsg('An unexpected error occurred.')
      }
    }
  }

  const filteredProjects = projects?.filter((project) =>
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">

      {/* Title & Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Company Projects</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Manage and monitor progress across your workspace projects.
          </p>
        </div>
        <button
          onClick={() => { setErrorMsg(null); setModalOpen(true) }}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg cursor-pointer shadow-sm shadow-blue-500/10"
        >
          <Plus size={16} />
          <span>New Project</span>
        </button>
      </div>

      {/* Search Filter bar */}
      <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg px-3 py-2 max-w-md animate-fade-in">
        <Search size={18} className="text-slate-400" />
        <input
          type="text"
          placeholder="Search projects..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="bg-transparent border-0 outline-none text-sm w-full focus:ring-0 dark:text-white"
        />
      </div>

      {/* Main Grid View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 space-y-4">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-2/3"></div>
              <div className="space-y-2">
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded"></div>
                <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-5/6"></div>
              </div>
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-1/4 pt-4"></div>
            </div>
          ))}
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl">
          <Folder size={48} className="text-red-500 mb-4 animate-bounce" />
          <h3 className="font-bold text-lg text-slate-950 dark:text-white">Unable to load projects</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Please check your network or try reloading.</p>
          <button
            onClick={() => refetch()}
            className="mt-4 inline-flex items-center justify-center px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg text-sm font-semibold transition-colors cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : filteredProjects && filteredProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
          {filteredProjects.map((project) => (
            <Link
              key={project.id}
              to={`/dashboard/projects/${project.id}`}
              className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm flex flex-col justify-between hover:shadow-md transition-all group hover:border-blue-100 dark:hover:border-blue-900/50"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {project.title}
                  </h3>
                  <button className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                    <MoreVertical size={16} />
                  </button>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">
                  {project.description || 'No description provided.'}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-slate-800 space-y-4">
                {/* Progress bar mock */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
                    <span>Task Progress</span>
                    <span>70%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full animate-pulse" style={{ width: '70%' }}></div>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </span>

                  {/* Mock avatars */}
                  <div className="flex -space-x-1.5 overflow-hidden">
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-[10px] font-bold text-blue-600 dark:text-blue-400">
                      JD
                    </div>
                    <div className="inline-block h-6 w-6 rounded-full ring-2 ring-white dark:ring-slate-900 bg-green-100 dark:bg-green-900 flex items-center justify-center text-[10px] font-bold text-green-600 dark:text-green-400">
                      AS
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl min-h-[300px]">
          <Folder size={48} className="text-slate-300 dark:text-slate-700 mb-4" />
          <h3 className="font-bold text-lg text-slate-950 dark:text-white">No projects found</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-sm">
            {searchQuery ? 'No projects match your search query.' : 'Create your first project to start tracking tasks and deadlines.'}
          </p>
          {!searchQuery && (
            <button
              onClick={() => { setErrorMsg(null); setModalOpen(true) }}
              className="mt-4 inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg cursor-pointer"
            >
              <Plus size={16} />
              <span>Create Project</span>
            </button>
          )}
        </div>
      )}

      {/* Create Project Modal Dialog */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-lg w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150">

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-lg font-bold text-slate-950 dark:text-white">Create New Project</h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 cursor-pointer animate-spin-hover"
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
            <form onSubmit={handleSubmit(onSubmit)} className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Project Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Website Redesign"
                  disabled={createMutation.isPending}
                  {...register('title')}
                  className={`mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-900 dark:text-white ${
                    errors.title ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
                {errors.title && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  Description
                </label>
                <textarea
                  placeholder="Describe the scope, objectives, or key deliverables..."
                  disabled={createMutation.isPending}
                  rows={4}
                  {...register('description')}
                  className={`mt-1.5 block w-full px-4 py-2.5 bg-gray-50 border rounded-lg text-sm transition-all focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 disabled:opacity-50 dark:bg-gray-900 dark:text-white ${
                    errors.description ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20' : 'border-slate-200 dark:border-slate-800'
                  }`}
                />
                {errors.description && (
                  <p className="mt-1.5 text-xs text-red-500">{errors.description.message}</p>
                )}
              </div>

              {/* Form Footer Actions */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  disabled={createMutation.isPending}
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 text-sm font-semibold rounded-lg transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-colors rounded-lg cursor-pointer disabled:opacity-50"
                >
                  {createMutation.isPending ? 'Creating...' : 'Create'}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  )
}
